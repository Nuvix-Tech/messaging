import * as jwt from "jsonwebtoken";

export class JWT {
	/**
	 * Convert an object to a JWT, signed with the given key and algorithm.
	 */
	public static encode(
		payload: Record<string, any>,
		key: string,
		algorithm: string,
		keyId?: string,
	): string {
		const options: jwt.SignOptions = {
			algorithm: algorithm as jwt.Algorithm,
		};

		if (keyId) {
			options.keyid = keyId;
		}

		return jwt.sign(payload, key, options);
	}

	/**
	 * Verify and decode a JWT token.
	 */
	public static decode(token: string, key: string, algorithm?: string): any {
		const options: jwt.VerifyOptions = {};

		if (algorithm) {
			options.algorithms = [algorithm as jwt.Algorithm];
		}

		return jwt.verify(token, key, options);
	}

	/**
	 * Decode JWT without verification (not recommended for production).
	 */
	public static decodeWithoutVerification(token: string): any {
		return jwt.decode(token);
	}
}
