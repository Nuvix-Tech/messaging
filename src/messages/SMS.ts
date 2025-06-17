import type { Message } from "../types";

export interface SMSProps {
  to: string[];
  content: string;
  from?: string;
  attachments?: string[];
}

export class SMS implements Message {
  private to: string[];
  private content: string;
  private from?: string;
  private attachments?: string[];

  constructor(props: SMSProps);
  constructor(
    to: string[],
    content: string,
    from?: string,
    attachments?: string[],
  );
  constructor(
    propsOrTo: SMSProps | string[],
    content?: string,
    from?: string,
    attachments?: string[],
  ) {
    if (Array.isArray(propsOrTo)) {
      this.to = propsOrTo;
      this.content = content!;
      this.from = from;
      this.attachments = attachments;
    } else {
      this.to = propsOrTo.to;
      this.content = propsOrTo.content;
      this.from = propsOrTo.from;
      this.attachments = propsOrTo.attachments;
    }
  }

  getTo(): string[] {
    return this.to;
  }

  getContent(): string {
    return this.content;
  }

  getFrom(): string | undefined {
    return this.from;
  }

  getAttachments(): string[] | undefined {
    return this.attachments;
  }
}
