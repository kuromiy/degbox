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
}
