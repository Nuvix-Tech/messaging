export interface ResultDetail {
	recipient: string;
	status: "success" | "failure";
	error: string;
}

export interface ResponseObject {
	deliveredTo: number;
	type: string;
	results: ResultDetail[];
}

export class Response {
	private deliveredTo: number;
	private type: string;
	private results: ResultDetail[];

	constructor(type: string) {
		this.type = type;
		this.deliveredTo = 0;
		this.results = [];
	}

	public setDeliveredTo(deliveredTo: number): void {
		this.deliveredTo = deliveredTo;
	}

	public incrementDeliveredTo(): void {
		this.deliveredTo++;
	}

	public getDeliveredTo(): number {
		return this.deliveredTo;
	}

	public setType(type: string): void {
		this.type = type;
	}

	public getType(): string {
		return this.type;
	}

	public getDetails(): ResultDetail[] {
		return this.results;
	}

	public addResult(recipient: string, error = ""): void {
		this.results.push({
			recipient,
			status: error === "" ? "success" : "failure",
			error,
		});
	}

	public toObject(): ResponseObject {
		return {
			deliveredTo: this.deliveredTo,
			type: this.type,
			results: this.results,
		};
	}
}
