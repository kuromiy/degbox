import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export default function IndexPage() {
	async function fetchHealth() {
		const response = await client.checkHealth();
		console.log(response);
	}

	return (
		<div>
			<h1>Index Page</h1>
			<button type="button" onClick={fetchHealth}>
				Click Me
			</button>
		</div>
	);
}
