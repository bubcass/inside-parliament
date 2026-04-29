<script lang="ts">
    import { base } from "$app/paths";
    import type { ChartStoryBlock } from "$lib/content/types";
    import * as Plot from "@observablehq/plot";
    import * as d3 from "d3";
    import { onMount } from "svelte";

    type CountRow = {
        name: string;
        votes: number;
        allocation: number;
        count: number;
        status: string;
        URI: string;
        party: string;
        election_year: number;
        quota: number;
        surname: string;
    };

    const PARTY_COLORS: Record<string, string> = {
        "Fianna Fáil": "#40b34e",
        "Sinn Féin": "#088460",
        "Fine Gael": "#303591",
        Independent: "#666666",
        "Labour Party": "#c82832",
        "Social Democrats": "#782b81",
        "Green Party": "#b4d143",
    };

    const STATUS_COLORS = {
        Continuing: "#1f77b4",
        Eliminated: "#dadbdc",
        Elected: "#ff7f0e",
    } as const;

    let { block }: { block: ChartStoryBlock } = $props();

    let rows = $state<CountRow[]>([]);
    let selectedYear = $state<number | null>(null);
    let selectedCount = $state<number | null>(null);
    let errorMessage = $state<string | null>(null);
    let chartFrame = $state<HTMLDivElement | null>(null);
    let plotHost = $state<HTMLDivElement | null>(null);
    let plotElement: ChildNode | null = null;
    let frameWidth = $state(0);

    let availableYears = $derived(
        [...new Set(rows.map((row) => row.election_year))].sort(
            (a, b) => a - b,
        ),
    );

    let yearRows = $derived(
        selectedYear === null
            ? []
            : rows.filter((row) => row.election_year === selectedYear),
    );

    let availableCounts = $derived(
        [...new Set(yearRows.map((row) => row.count))].sort((a, b) => a - b),
    );

    let finalCount = $derived(
        selectedCount === null
            ? []
            : yearRows
                  .filter((row) => row.count === selectedCount)
                  .sort((a, b) => d3.descending(a.votes, b.votes)),
    );

    let quota = $derived(finalCount[0]?.quota ?? 0);
    let fxDomain = $derived(finalCount.map((row) => row.name));

    function partyColor(party: string) {
        return PARTY_COLORS[party] ?? "#8b816d";
    }

    function memberImage(uri: string) {
        return `https://data.oireachtas.ie/ie/oireachtas/member/id/${encodeURI(uri)}/image/thumb`;
    }

    function chartBaseId() {
        return `plot-${(block.chart ?? "story-chart").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
    }

    function chartAriaLabel() {
        const title = block.title?.trim() || "Ceann Comhairle election chart";
        const year = selectedYear !== null ? `, ${selectedYear}` : "";
        const count = selectedCount !== null ? `, count ${selectedCount}` : "";
        return `${title}. Waffle chart showing Ceann Comhairle election vote totals by candidate and count status${year}${count}.`;
    }

    function chartAriaDescription() {
        const caption = block.caption?.trim();
        const summary =
            selectedCount !== null && quota
                ? `The chart updates by selected count and shows each candidate's vote total, status and progress towards the quota of ${quota} votes.`
                : "The chart updates by selected count and shows each candidate's vote total, status and progress towards the quota.";

        return caption ? `${caption} ${summary}` : summary;
    }

    function applyPlotAccessibility(plot: Element) {
        const svgs =
            plot instanceof SVGSVGElement
                ? [plot]
                : Array.from(plot.querySelectorAll("svg"));

        if (!svgs.length) return;

        const svg = svgs[svgs.length - 1];

        const baseId = chartBaseId();
        const titleId = `${baseId}-title`;
        const descId = `${baseId}-desc`;

        svg.setAttribute("role", "img");
        svg.setAttribute("aria-labelledby", `${titleId} ${descId}`);

        let title = svg.querySelector("title") as SVGTitleElement | null;
        if (!title) {
            title = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "title",
            ) as SVGTitleElement;
            svg.prepend(title);
        }
        title.setAttribute("id", titleId);
        title.textContent = chartAriaLabel();

        let desc = svg.querySelector("desc") as SVGDescElement | null;
        if (!desc) {
            desc = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "desc",
            ) as SVGDescElement;
            title.after(desc);
        }
        desc.setAttribute("id", descId);
        desc.textContent = chartAriaDescription();

        for (const node of plot.querySelectorAll("g[aria-label]")) {
            node.removeAttribute("aria-label");
        }
    }

    onMount(() => {
        let resizeObserver: ResizeObserver | null = null;

        async function loadData() {
            try {
                const loaded = await d3.csv(
                    `${base}${block.data}`,
                    d3.autoType,
                );
                rows = loaded as CountRow[];
                selectedYear =
                    d3.max(rows, (row: CountRow) => row.election_year) ?? null;
            } catch (error) {
                console.error(error);
                errorMessage = "Unable to load chart data.";
            }
        }

        loadData();

        if (chartFrame) {
            resizeObserver = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (!entry) return;
                frameWidth = entry.contentRect.width;
            });
            resizeObserver.observe(chartFrame);
            frameWidth = chartFrame.getBoundingClientRect().width;
        }

        return () => {
            resizeObserver?.disconnect();
            if (plotElement) {
                plotElement.remove();
            }
        };
    });

    $effect(() => {
        if (!availableYears.length) return;
        if (selectedYear === null || !availableYears.includes(selectedYear)) {
            selectedYear = availableYears[availableYears.length - 1];
        }
    });

    $effect(() => {
        if (!availableCounts.length) return;
        if (
            selectedCount === null ||
            !availableCounts.includes(selectedCount)
        ) {
            selectedCount = availableCounts[availableCounts.length - 1];
        }
    });

    $effect(() => {
        if (
            !plotHost ||
            !finalCount.length ||
            selectedYear === null ||
            selectedCount === null
        )
            return;

        if (plotElement) {
            plotElement.remove();
            plotElement = null;
        }

        const maxVotes = d3.max(finalCount, (row: CountRow) => row.votes) ?? 0;
        const yTop = Math.max(quota, maxVotes) + 20;
        const idealWidth = Math.max(860, finalCount.length * 170);
        const plotWidth = frameWidth
            ? Math.max(320, Math.min(idealWidth, frameWidth))
            : idealWidth;
        const compactPlot = plotWidth < 760;
        const tightPlot = plotWidth < 560;

        try {
            const plot = Plot.plot({
                width: plotWidth,
                height: tightPlot ? 430 : compactPlot ? 480 : 550,
                marginTop: tightPlot ? 72 : 96,
                marginRight: 10,
                marginBottom: tightPlot ? 84 : 100,
                marginLeft: 10,
                axis: null,
                style: {
                    background: "transparent",
                    fontFamily: "IBM Plex Sans, var(--font-sans)",
                    fontSize: compactPlot ? "11px" : "12px",
                    padding: "5px",
                },
                fx: {
                    domain: fxDomain,
                    label: null,
                },
                y: {
                    domain: [0, yTop],
                    grid: false,
                    label: "Votes",
                },
                color: {
                    domain: ["Continuing", "Eliminated", "Elected"],
                    range: [
                        STATUS_COLORS.Continuing,
                        STATUS_COLORS.Eliminated,
                        STATUS_COLORS.Elected,
                    ],
                    legend: true,
                    label: "Count status",
                    swatchWidth: 25,
                    columns: 3,
                    marginLeft: 10,
                    marginTop: 20,
                } as any,
                marks: [
                    Plot.axisFx({
                        lineWidth: 1,
                        anchor: "bottom",
                        dy: tightPlot ? 20 : 30,
                        fontWeight: "bold",
                    }),
                    Plot.waffleY([{ length: 1 }], {
                        y: quota,
                        fillOpacity: 0.3,
                        rx: "100%",
                    } as any),
                    Plot.waffleY(finalCount, {
                        fx: "name",
                        y: (row) => row.votes,
                        rx: "100%",
                        fill: "status",
                        channels: {
                            Name: "name",
                            Votes: "votes",
                            Party: "party",
                            Quota: (row: CountRow) =>
                                `${Math.round((row.votes / quota) * 100)}% of quota`,
                            status: {
                                value: "status",
                                label: "Status in count",
                            },
                        },
                        tip: {
                            format: {
                                Name: true,
                                status: false,
                                Votes: true,
                                y: false,
                                fx: false,
                                stroke: false,
                            },
                        },
                    }),
                    Plot.text(finalCount, {
                        fx: "name",
                        text: (row) => `${row.votes} votes`,
                        frameAnchor: "bottom",
                        lineAnchor: "top",
                        dy: 8,
                        fill: "status",
                        fontSize: tightPlot ? 12 : compactPlot ? 14 : 17,
                        fontFamily: "IBM Plex Sans, var(--font-sans)",
                        fontWeight: "bold",
                    }),
                    Plot.circle(finalCount, {
                        fx: "name",
                        y: "votes",
                        filter: (row: CountRow) => row.votes > 1,
                        r: tightPlot ? 20 : compactPlot ? 24 : 30,
                        dy: tightPlot ? -34 : compactPlot ? -40 : -50,
                        fill: "none",
                        stroke: (row) => partyColor(row.party),
                        strokeWidth: tightPlot ? 5 : 7,
                    }),
                    Plot.image(finalCount, {
                        fx: "name",
                        y: "votes",
                        filter: (row: CountRow) => row.votes > 1,
                        r: tightPlot ? 18 : compactPlot ? 22 : 28,
                        dy: tightPlot ? -34 : compactPlot ? -40 : -50,
                        href: (row: CountRow) =>
                            `https://www.oireachtas.ie/en/members/member/${encodeURI(row.URI)}`,
                        target: "_blank",
                        src: (row: CountRow) => memberImage(row.URI),
                        title: (row: CountRow) =>
                            `Deputy ${row.name} has ${row.votes} votes. Click to see Member profile.`,
                        preserveAspectRatio: "xMidYMin slice",
                    } as any),
                ],
            });

            applyPlotAccessibility(plot);
            plotHost.append(plot);
            plotElement = plot;
            errorMessage = null;
        } catch (error) {
            console.error(error);
            errorMessage = "Unable to render chart.";
        }
    });
</script>

<section class="chart-block">
    {#if block.title || block.caption}
        <div class="chart-block__intro">
            {#if block.title}
                <h2>{block.title}</h2>
            {/if}
            {#if block.caption}
                <p class="caption">{block.caption}</p>
            {/if}
            {#if selectedCount !== null && quota}
                <p class="chart-block__summary">
                    After <strong>count No. {selectedCount}</strong>. A Deputy
                    requires <strong>{quota} votes</strong> to be elected.
                </p>
            {/if}
        </div>
    {/if}

    <div class="chart-stage">
        <div class="chart-control">
            {#if availableYears.length > 1}
                <label for="year-select">Year</label>
                <select id="year-select" bind:value={selectedYear}>
                    {#each availableYears as year}
                        <option value={year}>{year}</option>
                    {/each}
                </select>
            {/if}

            {#if availableCounts.length > 0}
                <div class="count-pills" role="group" aria-label="Count">
                    {#each availableCounts as count}
                        <button
                            type="button"
                            class:active={selectedCount === count}
                            aria-pressed={selectedCount === count}
                            onclick={() => (selectedCount = count)}
                        >
                            {count}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>

        <div bind:this={chartFrame} class="plot-frame">
            {#if errorMessage}
                <p class="chart-block__status">{errorMessage}</p>
            {:else if !rows.length}
                <p class="chart-block__status">Loading chart…</p>
            {:else}
                <div class="plot-container">
                    <div bind:this={plotHost} class="plot-host"></div>
                </div>
            {/if}
        </div>
    </div>
</section>

<style>
    .chart-block {
        margin: var(--block-space) auto;
        max-width: min(var(--wide), calc(100vw - (var(--gutter) * 2)));
    }

    .chart-block__intro {
        margin: 0 auto var(--space-4);
        max-width: var(--measure);
    }

    .chart-block__intro h2 {
        color: var(--color-accent-2);
        font-family: var(--font-sans);
        font-size: var(--font-size-h2);
        font-weight: var(--font-weight-heading);
        line-height: var(--line-height-heading);
        margin: 0 0 var(--space-2);
        text-wrap: balance;
    }

    .chart-block__intro .caption {
        margin: 0;
        max-width: 100%;
    }

    .chart-block__summary {
        color: var(--color-muted);
        font-family: var(--font-serif);
        font-size: var(--font-size-body);
        font-weight: var(--font-weight-body);
        line-height: var(--line-height-body);
        margin: var(--space-2) 0 0;
        max-width: var(--measure-prose);
    }

    .chart-block__summary :global(strong) {
        color: var(--color-accent-2);
        font-weight: 600;
    }

    .chart-control {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        column-gap: var(--space-3);
        row-gap: var(--space-2);
        justify-content: flex-start;
        margin: 0 auto var(--space-3);
        max-width: var(--measure-prose);
    }

    .chart-control label {
        color: var(--color-muted);
        font-family: var(--font-sans);
        font-size: var(--font-size-small);
        line-height: var(--line-height-small);
    }

    .chart-control select {
        appearance: none;
        background: transparent;
        border: 1px solid var(--color-line);
        border-radius: 0;
        color: var(--color-ink);
        font-family: var(--font-sans);
        font-size: var(--font-size-small);
        line-height: var(--line-height-small);
        padding: 0.5rem 2rem 0.5rem 0.75rem;
    }

    .chart-control select:disabled {
        color: var(--color-faint);
    }

    .count-pills {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 0.6rem;
    }

    .count-pills button {
        appearance: none;
        background: transparent;
        border: 1px solid var(--color-line);
        border-radius: 999px;
        color: var(--color-muted);
        cursor: pointer;
        font-family: var(--font-sans);
        font-size: var(--font-size-small);
        line-height: 1;
        padding: 0.5rem 0.8rem;
        transition:
            background-color 120ms ease,
            border-color 120ms ease,
            color 120ms ease;
    }

    .count-pills button:hover,
    .count-pills button:focus-visible {
        border-color: var(--color-line-strong);
        color: var(--color-ink);
    }

    .count-pills button.active {
        background: var(--color-accent-2);
        border-color: var(--color-accent-2);
        color: var(--color-paper);
    }

    .chart-stage {
        margin: 0 auto;
        max-width: var(--wide);
    }

    .plot-frame {
        margin: 0 auto;
        max-width: var(--wide);
        width: 100%;
    }

    .plot-container {
        display: flex;
        justify-content: center;
        overflow-x: hidden;
        padding-bottom: var(--space-2);
    }

    .plot-host {
        min-width: 100%;
        width: 100%;
    }

    .plot-host :global(svg) {
        display: block;
        height: auto;
        max-width: 100%;
    }

    .plot-host :global(.plot) {
        color: var(--color-ink);
    }

    .plot-host :global(.plot .domain) {
        stroke: var(--color-line);
    }

    .plot-host :global(.plot .tick line),
    .plot-host :global(.plot .grid line) {
        stroke: #ded7cb;
    }

    .chart-block__status {
        color: var(--color-muted);
        font-family: var(--font-sans);
        font-size: var(--font-size-small);
        margin: 0;
    }

    @media (max-width: 700px) {
        .chart-control {
            column-gap: var(--space-2);
            justify-content: flex-start;
        }

        .chart-stage {
            max-width: none;
        }

        .plot-host {
            min-width: 100%;
        }
    }
</style>
