export interface Line {
	id: string;
	input: string;
}

export interface EvaluatedLine extends Line {
	result: number | null;
	error: string | null;
}
