import type { Message } from "../types";
import { Attachment } from "./email/Attachment";

interface EmailRecipient {
  name?: string;
  email: string;
}

interface EmailConstructorProps {
  to: string[];
  subject: string;
  content: string;
  fromName: string;
  fromEmail: string;
  replyToName?: string;
  replyToEmail?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: Attachment[];
  html?: boolean;
  defaultRecipient?: string;
}

export class Email implements Message {
  private to: string[];
  private subject: string;
  private content: string;
  private fromName: string;
  private fromEmail: string;
  private replyToName: string;
  private replyToEmail: string;
  private cc?: EmailRecipient[];
  private bcc?: EmailRecipient[];
  private attachments?: Attachment[];
  private html: boolean;
  private defaultRecipient?: string;

  constructor(props: EmailConstructorProps) {
    this.to = props.to;
    this.subject = props.subject;
    this.content = props.content;
    this.fromName = props.fromName;
    this.fromEmail = props.fromEmail;
    this.replyToName = props.replyToName ?? props.fromName;
    this.replyToEmail = props.replyToEmail ?? props.fromEmail;
    this.cc = props.cc ?? [];
    this.bcc = props.bcc ?? [];
    this.attachments = props.attachments ?? [];
    this.html = props.html ?? false;
    this.defaultRecipient = props.defaultRecipient;

    if (this.cc) {
      for (const recipient of this.cc) {
        if (!recipient.email) {
          throw new Error("Each CC recipient must have at least an email");
        }
      }
    }

    if (this.bcc) {
      for (const recipient of this.bcc) {
        if (!recipient.email) {
          throw new Error("Each BCC recipient must have at least an email");
        }
      }
    }
  }

  getTo(): string[] {
    return this.to;
  }

  getSubject(): string {
    return this.subject;
  }

  getContent(): string {
    return this.content;
  }

  getFromName(): string {
    return this.fromName;
  }

  getFromEmail(): string {
    return this.fromEmail;
  }

  getReplyToName(): string {
    return this.replyToName;
  }

  getReplyToEmail(): string {
    return this.replyToEmail;
  }

  getCC(): EmailRecipient[] | undefined {
    return this.cc;
  }

  getBCC(): EmailRecipient[] | undefined {
    return this.bcc;
  }

  getAttachments(): Attachment[] | undefined {
    return this.attachments;
  }

  isHtml(): boolean {
    return this.html;
  }

  getDefaultRecipient(): string | undefined {
    return this.defaultRecipient;
  }
}
