<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import * as d3 from 'd3';
  import type { VoteMapStoryBlock } from '$lib/content/types';

  type AssignmentRow = {
    seat_label: string;
    deputy_name: string;
    member_code: string;
    path_id: string;
    start_date: string;
    end_date?: string;
  };

  type MemberRow = {
    Deputy?: string;
    deputy?: string;
    Party?: string;
    Constituency?: string;
    Code?: string;
    name?: string;
    party?: string;
    constituency?: string;
    memberCode?: string;
  };

  type Member = {
    Deputy: string;
    Party: string;
    Constituency: string;
    Code: string;
    imageUrl: string;
  };

  type NormalisedVote = {
    id: string;
    voteID: string;
    outcome: string;
    subject: string;
    debateShowAs: string;
    section: string;
    date: string;
    tallies: Record<string, number>;
    byMemberCode: Record<string, { vote: string; memberCode: string; showAs: string; uri: string }>;
  };

  type SeatRecord = {
    seat_label: string;
    assignment: AssignmentRow | null;
    member: Member | null;
    vote: { vote: string; memberCode: string; showAs: string; uri: string } | null;
  };

  type Tooltip = {
    x: number;
    y: number;
    name: string;
    party: string;
    constituency: string;
    color: string;
    image: string;
    vote: string | null;
  };

  let { block }: { block: VoteMapStoryBlock } = $props();

  let assignments = $state<AssignmentRow[]>([]);
  let members = $state<Member[]>([]);
  let selectedVote = $state<NormalisedVote | null>(null);
  let svgMarkup = $state('');
  let selectedSeat = $state<string | null>(null);
  let tooltip = $state<Tooltip | null>(null);
  let errorMessage = $state<string | null>(null);
  let mapRoot: HTMLDivElement | undefined = $state();
  let frameRoot: HTMLDivElement | undefined = $state();

  const partyColorMap: Record<string, string> = {
    'Fianna Fáil': '#2c8737',
    'Sinn Féin': '#088460',
    'Fine Gael': '#303591',
    Independent: '#666666',
    'Labour Party': '#c82832',
    'Social Democrats': '#782b81',
    'Independent Ireland': '#087b87',
    'People Before Profit-Solidarity': '#be417d',
    'Aontú': '#b35400',
    '100% RDR': '#985564',
    'Green Party': '#6c7e26'
  };

  const voteColorMap: Record<string, string> = {
    Tá: '#2e8b57',
    Níl: '#c0392b',
    Staon: '#84a1c4',
    Absent: '#d6d3d1'
  };

  const clean = (value: unknown) => (value == null ? '' : String(value).trim());

  let blockSlug = $derived(
    (block.title || 'vote-map')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  );
  let frameLabelId = $derived(`${blockSlug}-vote-map-label`);
  let frameHintId = $derived(`${blockSlug}-vote-map-hint`);
  let frameCaptionId = $derived(`${blockSlug}-vote-map-caption`);

  function normaliseMemberApiRows(rows: MemberRow[]): Member[] {
    return rows.map((row) => {
      const Code = clean(row.Code ?? row.memberCode);

      return {
        Deputy: clean(row.Deputy ?? row.deputy ?? row.name),
        Party: clean(row.Party ?? row.party),
        Constituency: clean(row.Constituency ?? row.constituency),
        Code,
        imageUrl: Code ? `https://data.oireachtas.ie/ie/oireachtas/member/id/${Code}/image/large` : ''
      };
    });
  }

  function normaliseVoteRecord(record: any): NormalisedVote {
    const byMemberCode: NormalisedVote['byMemberCode'] = {};
    const groups = [
      ['Tá', record?.tallies?.taVotes],
      ['Níl', record?.tallies?.nilVotes],
      ['Staon', record?.tallies?.staonVotes]
    ] as const;

    for (const [label, group] of groups) {
      const groupMembers = group?.members ?? [];

      for (const item of groupMembers) {
        const memberCode = item?.member?.memberCode;
        if (!memberCode) continue;

        byMemberCode[memberCode] = {
          vote: label,
          memberCode,
          showAs: item?.member?.showAs ?? '',
          uri: item?.member?.uri ?? ''
        };
      }
    }

    return {
      id: record?.voteID ?? '',
      voteID: record?.voteID ?? '',
      outcome: record?.outcome ?? '',
      subject: record?.subject ?? '',
      debateShowAs: record?.debateShowAs ?? '',
      section: record?.section ?? '',
      date: record?.date ?? '',
      tallies: {
        Tá: record?.tallies?.taVotes?.tally ?? 0,
        Níl: record?.tallies?.nilVotes?.tally ?? 0,
        Staon: record?.tallies?.staonVotes?.tally ?? 0
      },
      byMemberCode
    };
  }

  function resolveSeatForDate(rows: AssignmentRow[], memberCode: string, voteDate: string) {
    if (!memberCode || !voteDate) return null;

    const voteTime = new Date(voteDate).getTime();

    return (
      rows.find((row) => {
        const rowMemberCode = clean(row.member_code);
        if (rowMemberCode !== clean(memberCode)) return false;

        const start = new Date(row.start_date).getTime();
        const end = row.end_date ? new Date(row.end_date).getTime() : Infinity;
        return voteTime >= start && voteTime <= end;
      }) ?? null
    );
  }

  let seats = $derived.by(() => {
    const vote = selectedVote;
    if (!vote) return [] as SeatRecord[];

    return members
      .map((member) => {
        const assignment = resolveSeatForDate(assignments, member.Code, vote.date);
        if (!assignment?.seat_label) return null;

        return {
          seat_label: clean(assignment.seat_label),
          assignment,
          member,
          vote: vote.byMemberCode[clean(member.Code)] ?? null
        } as SeatRecord;
      })
      .filter((seat): seat is NonNullable<typeof seat> => seat !== null);
  });

  let seatIndex = $derived.by(() => new Map(seats.map((seat) => [seat.seat_label, seat] as const)));

  let selectedSeatRecord = $derived(selectedSeat ? seatIndex.get(selectedSeat) ?? null : null);

  let tallyItems = $derived(
    selectedVote
      ? [
          { label: 'Tá', count: selectedVote.tallies['Tá'] ?? 0, color: voteColorMap['Tá'] },
          { label: 'Níl', count: selectedVote.tallies['Níl'] ?? 0, color: voteColorMap['Níl'] },
          { label: 'Staon', count: selectedVote.tallies['Staon'] ?? 0, color: voteColorMap['Staon'] }
        ]
      : []
  );

  function handleFrameKeydown(event: KeyboardEvent) {
    if (!frameRoot) return;

    const step = 80;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      frameRoot.scrollBy({ left: step, behavior: 'smooth' });
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      frameRoot.scrollBy({ left: -step, behavior: 'smooth' });
    }
  }

  onMount(() => {
    async function load() {
      try {
        const [svgRes, seatRows, voteRes, membersRes] = await Promise.all([
          fetch(`${base}${block.chamberSvg}`),
          d3.csv(`${base}${block.seatData}`, d3.autoType),
          fetch(`${base}${block.voteData}`),
          fetch(`${base}${block.membersData}`)
        ]);

        if (!svgRes.ok || !voteRes.ok || !membersRes.ok) {
          throw new Error('Unable to load vote-map assets.');
        }

        svgMarkup = (await svgRes.text()).replace(/<\?xml[^>]*>\s*/i, '');
        assignments = seatRows.map((row: any) => ({
          seat_label: clean(row.seat_label),
          deputy_name: clean(row.deputy_name ?? row.Deputy),
          member_code: clean(row.member_code ?? row.memberCode),
          path_id: clean(row.path_id),
          start_date: clean(row.start_date),
          end_date: clean(row.end_date)
        }));

        const voteJson = await voteRes.json();
        const membersJson = await membersRes.json();
        members = normaliseMemberApiRows(membersJson);
        selectedVote = normaliseVoteRecord(Array.isArray(voteJson) ? voteJson[0] : voteJson);
      } catch (error) {
        console.error(error);
        errorMessage = 'Unable to load chamber vote map.';
      }
    }

    load();
  });

  $effect(() => {
    if (!mapRoot || !svgMarkup || !selectedVote) return;

    const svgRoot = mapRoot.querySelector('.vote-map__svg');
    if (!svgRoot) return;

    const seatEls = svgRoot.querySelectorAll<SVGElement>('.seat[data-seat]');
    const shapeSelector = 'path, ellipse, rect, polygon, circle';

    const paintSeat = (el: SVGElement) => {
      const seatLabel = el.getAttribute('data-seat') ?? '';
      const seat = seatIndex.get(seatLabel) ?? null;
      const fill = seat?.member ? voteColorMap[seat.vote?.vote || 'Absent'] : '#ffffff';
      const isSelected = seatLabel === selectedSeat;

      const applyStateToShape = (shape: Element) => {
        const svgShape = shape as SVGElement;
        svgShape.style.fill = fill;
        svgShape.style.transition = 'fill 0.25s ease, opacity 0.2s ease, stroke 0.2s ease';

        if (isSelected) {
          svgShape.style.stroke = '#111827';
          svgShape.style.strokeWidth = '1.4';
          svgShape.style.opacity = '1';
        } else {
          svgShape.style.stroke = 'none';
          svgShape.style.strokeWidth = '0';
          svgShape.style.opacity = seat?.member ? '1' : '0.4';
        }
      };

      if (el.tagName.toLowerCase() === 'g') {
        el.querySelectorAll(shapeSelector).forEach(applyStateToShape);
      } else {
        applyStateToShape(el);
      }

      el.style.cursor = seat?.member ? 'pointer' : 'default';
    };

    seatEls.forEach(paintSeat);

    const findSeatEl = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      return target.closest('.seat[data-seat]') as SVGElement | null;
    };

    const handlePointerMove = (event: Event) => {
      if (!(event instanceof PointerEvent) || !mapRoot) {
        tooltip = null;
        return;
      }

      const seatEl = findSeatEl(event.target);
      if (!seatEl) {
        tooltip = null;
        return;
      }

      const seatLabel = seatEl.getAttribute('data-seat') ?? '';
      const seat = seatIndex.get(seatLabel);
      if (!seat?.member) {
        tooltip = null;
        return;
      }

      const containerRect = mapRoot.getBoundingClientRect();
      tooltip = {
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top - 14,
        name: seat.member.Deputy || seat.vote?.showAs || '',
        party: seat.member.Party,
        constituency: seat.member.Constituency || '',
        color: partyColorMap[seat.member.Party] || '#666666',
        image: seat.member.imageUrl || '',
        vote: seat.vote?.vote || null
      };
    };

    const handlePointerLeave = () => {
      tooltip = null;
    };

    const handleClick = (event: Event) => {
      if (!(event instanceof MouseEvent)) return;

      const seatEl = findSeatEl(event.target);
      if (!seatEl) return;

      const seatLabel = seatEl.getAttribute('data-seat') ?? '';
      const seat = seatIndex.get(seatLabel);
      if (!seat?.member) return;

      selectedSeat = selectedSeat === seatLabel ? null : seatLabel;
    };

    svgRoot.addEventListener('pointermove', handlePointerMove);
    svgRoot.addEventListener('pointerleave', handlePointerLeave);
    svgRoot.addEventListener('click', handleClick);

    return () => {
      svgRoot.removeEventListener('pointermove', handlePointerMove);
      svgRoot.removeEventListener('pointerleave', handlePointerLeave);
      svgRoot.removeEventListener('click', handleClick);
    };
  });
</script>

<section class="vote-map-block">
  {#if block.title || block.intro}
    <div class="vote-map-block__intro">
      {#if block.title}
        <h2>{block.title}</h2>
      {/if}
      {#if block.intro}
        <p>{block.intro}</p>
      {/if}
    </div>
  {/if}

  {#if errorMessage}
    <p class="vote-map-block__status">{errorMessage}</p>
  {:else if !selectedVote || !svgMarkup}
    <p class="vote-map-block__status">Loading chamber vote map…</p>
  {:else}
    <div class="vote-map-block__summary">
      <h3 id={frameLabelId} class="vote-map-block__subject">{selectedVote.debateShowAs || selectedVote.subject}</h3>
      <div class="vote-map-block__tallies" aria-label="Vote tallies">
        {#each tallyItems as item}
          <span class="tally-chip">
            <span class="tally-chip__swatch" style:background-color={item.color}></span>
            {item.label} {item.count}
          </span>
        {/each}
      </div>
      <p id={frameHintId} class="vote-map-block__hint">
        On smaller screens, swipe horizontally to explore the chamber map.
      </p>
    </div>

    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      bind:this={frameRoot}
      class="vote-map-frame"
      role="region"
      tabindex="0"
      aria-labelledby={frameLabelId}
      aria-describedby={block.caption ? `${frameHintId} ${frameCaptionId}` : frameHintId}
      onkeydown={handleFrameKeydown}
    >
      <div bind:this={mapRoot} class="vote-map-wrap">
        <div class="vote-map__svg" aria-label="Dáil chamber vote map">
          {@html svgMarkup}
        </div>

        {#if tooltip}
          <div class="vote-map-tooltip" style:left={`${tooltip.x}px`} style:top={`${tooltip.y}px`}>
            <div class="vote-map-tooltip__row">
              {#if tooltip.image}
                <img
                  src={tooltip.image}
                  alt=""
                  class="vote-map-tooltip__avatar"
                  style:border-color={tooltip.color}
                />
              {/if}
              <div class="vote-map-tooltip__text">
                <p class="vote-map-tooltip__name">{tooltip.name}</p>
                <div class="vote-map-tooltip__meta">
                  <span class="vote-map-tooltip__chip" style:background-color={tooltip.color}></span>
                  {tooltip.party}
                </div>
                {#if tooltip.vote}
                  <div class="vote-map-tooltip__meta">{tooltip.vote}</div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    {#if selectedSeatRecord?.member}
      <aside class="vote-map-card">
        <div class="vote-map-card__head">
          <div
            class="vote-map-card__ring"
            style:border-color={partyColorMap[selectedSeatRecord.member.Party] || '#d6d3d1'}
          >
            <img src={selectedSeatRecord.member.imageUrl} alt={selectedSeatRecord.member.Deputy} />
          </div>
          <div>
            <h3>{selectedSeatRecord.member.Deputy || selectedSeatRecord.vote?.showAs || 'Member'}</h3>
            {#if selectedSeatRecord.vote?.vote}
              <p>{selectedSeatRecord.vote.vote}</p>
            {/if}
          </div>
        </div>
        <dl class="vote-map-card__meta">
          <div>
            <dt>Party</dt>
            <dd>{selectedSeatRecord.member.Party || '—'}</dd>
          </div>
          <div>
            <dt>Constituency</dt>
            <dd>{selectedSeatRecord.member.Constituency || '—'}</dd>
          </div>
          <div>
            <dt>Seat</dt>
            <dd>{selectedSeatRecord.seat_label}</dd>
          </div>
        </dl>
      </aside>
    {/if}

    {#if block.caption}
      <p id={frameCaptionId} class="caption vote-map-block__caption">{block.caption}</p>
    {/if}
  {/if}
</section>

<style>
  .vote-map-block {
    margin: var(--block-space) auto;
    max-width: min(var(--wide), calc(100vw - (var(--gutter) * 2)));
  }

  .vote-map-block__intro,
  .vote-map-block__summary {
    margin: 0 auto;
    max-width: var(--measure-prose);
  }

  .vote-map-block__intro {
    margin-bottom: var(--space-4);
  }

  .vote-map-block__intro h2 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: var(--font-size-h2);
    font-weight: var(--font-weight-heading);
    line-height: var(--line-height-heading);
    margin: 0 0 var(--space-2);
  }

  .vote-map-block__intro p {
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    margin: 0;
  }

  .vote-map-block__summary {
    margin-bottom: var(--space-4);
  }

  .vote-map-block__subject {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: var(--font-size-h3);
    font-weight: var(--font-weight-heading);
    line-height: 1.18;
    margin: 0;
    text-wrap: balance;
  }

  .vote-map-block__tallies {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
    margin-top: var(--space-3);
  }

  .vote-map-block__hint {
    color: var(--color-faint);
    font-family: var(--font-sans);
    font-size: var(--font-size-small);
    line-height: var(--line-height-small);
    margin: var(--space-2) 0 0;
  }

  .tally-chip {
    align-items: center;
    color: var(--color-ink);
    display: inline-flex;
    font-family: var(--font-sans);
    font-size: var(--font-size-small);
    gap: 0.4rem;
  }

  .tally-chip__swatch,
  .vote-map-tooltip__chip {
    border-radius: 999px;
    display: inline-block;
    height: 0.75rem;
    width: 0.75rem;
  }

  .vote-map-frame {
    background: color-mix(in srgb, var(--color-soft) 76%, white);
    border: 1px solid var(--color-line);
    overflow-x: auto;
    padding: var(--space-4);
  }

  .vote-map-frame:focus-visible {
    outline: 2px solid var(--color-accent-2);
    outline-offset: 2px;
  }

  .vote-map-wrap {
    margin: 0 auto;
    min-width: 52rem;
    position: relative;
  }

  .vote-map__svg :global(svg) {
    display: block;
    height: auto;
    width: 100%;
  }

  .vote-map-tooltip {
    background: rgba(255, 253, 248, 0.96);
    border: 1px solid var(--color-line);
    border-radius: 0.5rem;
    box-shadow: 0 0.75rem 2rem rgba(47, 47, 47, 0.12);
    color: var(--color-ink);
    max-width: 15rem;
    padding: 0.6rem 0.75rem;
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, -100%);
    z-index: 5;
  }

  .vote-map-tooltip__row,
  .vote-map-card__head {
    align-items: flex-start;
    display: flex;
    gap: 0.75rem;
  }

  .vote-map-tooltip__text {
    display: grid;
    gap: 0.15rem;
    min-width: 0;
  }

  .vote-map-tooltip__avatar,
  .vote-map-card__ring img {
    border-radius: 999px;
    display: block;
    object-fit: cover;
  }

  .vote-map-tooltip__avatar {
    border: 3px solid transparent;
    height: 2.5rem;
    width: 2.5rem;
  }

  .vote-map-tooltip__name {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.2;
    margin: 0;
  }

  .vote-map-tooltip__meta {
    align-items: center;
    color: var(--color-muted);
    display: flex;
    font-size: 0.8rem;
    gap: 0.35rem;
    line-height: 1.2;
    margin-top: 0.15rem;
  }

  .vote-map-card {
    border-top: 1px solid var(--color-line);
    margin: var(--space-4) auto 0;
    max-width: var(--measure-prose);
    padding-top: var(--space-4);
  }

  .vote-map-card__ring {
    border: 4px solid transparent;
    border-radius: 999px;
    flex: none;
    height: 4rem;
    overflow: hidden;
    width: 4rem;
  }

  .vote-map-card__head h3 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: var(--font-size-h3);
    font-weight: var(--font-weight-heading);
    line-height: 1.15;
    margin: 0;
  }

  .vote-map-card__head p {
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    margin: 0.2rem 0 0;
  }

  .vote-map-card__meta {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: var(--space-4) 0 0;
  }

  .vote-map-card__meta dt {
    color: var(--color-faint);
    font-family: var(--font-sans);
    font-size: var(--font-size-small);
    letter-spacing: 0.06em;
    margin: 0 0 0.15rem;
    text-transform: uppercase;
  }

  .vote-map-card__meta dd {
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    line-height: 1.4;
    margin: 0;
  }

  .vote-map-block__status {
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-small);
    margin: 0;
  }

  .vote-map-block__caption {
    margin: var(--space-3) auto 0;
    max-width: var(--measure);
  }

  @media (max-width: 700px) {
    .vote-map-wrap {
      min-width: 42rem;
    }

    .vote-map-block__hint {
      display: block;
    }

    .vote-map-card__meta {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 701px) {
    .vote-map-block__hint {
      display: none;
    }
  }
</style>
