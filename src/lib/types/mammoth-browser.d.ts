declare module 'mammoth/mammoth.browser' {
  export interface ConvertToHtmlResult {
    value: string;
    messages: unknown[];
  }

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer },
    options?: {
      styleMap?: string[];
      includeDefaultStyleMap?: boolean;
    },
  ): Promise<ConvertToHtmlResult>;
}
