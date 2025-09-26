import type { Priority } from "../adapter";
import type { Message } from "../types";

export interface PushMessageProps {
	to: string[];
	title?: string;
	body?: string;
	data?: Record<string, any>;
	action?: string;
	sound?: string;
	image?: string;
	icon?: string;
	color?: string;
	tag?: string;
	badge?: number;
	contentAvailable?: boolean;
	critical?: boolean;
	priority?: Priority;
}

export class Push implements Message {
	private to: string[];
	private title?: string;
	private body?: string;
	private data?: Record<string, any>;
	private action?: string;
	private sound?: string;
	private image?: string;
	private icon?: string;
	private color?: string;
	private tag?: string;
	private badge?: number;
	private contentAvailable?: boolean;
	private critical?: boolean;
	private priority?: Priority;

	constructor(props: PushMessageProps) {
		if (!props.title && !props.body && !props.data) {
			throw new Error(
				"At least one of the following parameters must be set: title, body, data",
			);
		}

		this.to = props.to;
		this.title = props.title;
		this.body = props.body;
		this.data = props.data;
		this.action = props.action;
		this.sound = props.sound;
		this.image = props.image;
		this.icon = props.icon;
		this.color = props.color;
		this.tag = props.tag;
		this.badge = props.badge;
		this.contentAvailable = props.contentAvailable;
		this.critical = props.critical;
		this.priority = props.priority;
	}

	getTo(): string[] {
		return this.to;
	}

	getFrom(): string | null {
		return null;
	}

	getTitle(): string | undefined {
		return this.title;
	}

	getBody(): string | undefined {
		return this.body;
	}

	getData(): Record<string, any> | undefined {
		return this.data;
	}

	getAction(): string | undefined {
		return this.action;
	}

	getSound(): string | undefined {
		return this.sound;
	}

	getImage(): string | undefined {
		return this.image;
	}

	getIcon(): string | undefined {
		return this.icon;
	}

	getColor(): string | undefined {
		return this.color;
	}

	getTag(): string | undefined {
		return this.tag;
	}

	getBadge(): number | undefined {
		return this.badge;
	}

	getContentAvailable(): boolean | undefined {
		return this.contentAvailable;
	}

	getCritical(): boolean | undefined {
		return this.critical;
	}

	getPriority(): Priority | undefined {
		return this.priority;
	}
}
