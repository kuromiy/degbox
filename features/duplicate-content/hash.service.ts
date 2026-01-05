import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import sharp from "sharp";

export class HashService {
	async calcSha256(path: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const hash = createHash("sha256");
			const stream = createReadStream(path);
			stream.on("data", (chunk) => hash.update(chunk));
			stream.on("end", () => resolve(hash.digest("hex")));
			stream.on("error", reject);
		});
	}

	async calcDhash(path: string, size: number = 8): Promise<string> {
		// 画像をリサイズ + グレースケール
		// どんなサイズの画像でも9*8に圧縮
		// [R, G, B] 情報をグレースケールで輝度だけにする
		// 明暗情報をなくすことで構図で類似判定する
		const { data } = await sharp(path)
			.resize(size + 1, size, { fit: "fill" }) // 9*8ピクセル
			.grayscale() // グレースケール
			.raw() // 生ピクセルデータ
			.toBuffer({ resolveWithObject: true });

		// 隣接ピクセルを比較してビット列生成
		// 9列あるので8回比較できる（n列 → n-1回比較）
		// 8行 × 8比較 = 64ビットのハッシュ値
		// 左 < 右（右が明るい）なら "1"、そうでなければ "0"
		// 明暗の勾配パターンが似ていれば、似たハッシュ値になる
		let binary = "";
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const lIndex = y * (size + 1) + x;
				const rIndex = lIndex + 1;
				const left = data[lIndex] ?? 0;
				const right = data[rIndex] ?? 0;
				binary += left < right ? "1" : "0";
			}
		}

		// 2進数 -> 16進数
		return this.binaryToHex(binary);
	}

	private binaryToHex(binary: string): string {
		let hex = "";
		for (let i = 0; i < binary.length; i += 4) {
			hex += parseInt(binary.slice(i, i + 4), 2).toString(16);
		}
		return hex;
	}

	/**
	 * dHashのハミング距離から類似度を計算
	 * @param hash1 比較元の16進数ハッシュ
	 * @param hash2 比較先の16進数ハッシュ
	 * @returns 類似度（0-100%）
	 */
	compareByHammingDistance(hash1: string, hash2: string): number {
		if (hash1.length !== hash2.length) {
			throw new Error(
				`Hash length mismatch: hash1 has ${hash1.length} characters, hash2 has ${hash2.length} characters`,
			);
		}
		const distance = this.hammingDistance(hash1, hash2);
		// 16進数1文字 = 4ビット
		const bits = hash1.length * 4;
		// ハミング距離が0なら100%、全ビット異なれば0%
		return Math.round((1 - distance / bits) * 100);
	}

	/**
	 * 2つの16進数文字列のハミング距離を計算
	 * ハミング距離 = 異なるビットの個数
	 * @param a 16進数文字列
	 * @param b 16進数文字列
	 * @returns 異なるビット数
	 */
	private hammingDistance(a: string, b: string): number {
		let distance = 0;
		for (let i = 0; i < a.length; i++) {
			// XORで異なるビットを抽出
			const charA = a[i] ?? "0";
			const charB = b[i] ?? "0";
			const diff = parseInt(charA, 16) ^ parseInt(charB, 16);
			// 立っているビット数をカウント
			distance += this.popCount(diff);
		}
		return distance;
	}

	/**
	 * 数値の立っているビット数をカウント（ポップカウント）
	 * @param n 対象の数値
	 * @returns 1のビット数
	 */
	private popCount(n: number): number {
		let count = 0;
		while (n) {
			count += n & 1;
			n >>= 1;
		}
		return count;
	}
}
