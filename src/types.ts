export interface Message {
	getTo?: () => string[];
}

export interface MultiRequestResponse {
	index: number;
	url: string;
	statusCode: number;
	response: any;
	error: string | null;
}

export interface SendResult {
	deliveredTo: number;
	type: string;
	results: Array<Record<string, any>>;
}

export interface RequestResponse {
	url: string;
	statusCode: number;
	response: any;
	error: string | null;
}
