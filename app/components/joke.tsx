import { Link, Form } from "remix";
import type { Joke } from "@prisma/client";

export function JokeDisplay({
	joke,
	isOwner,
	canDelete = true
}: {
	joke: Pick<Joke, "content" | "name">;
	isOwner: boolean;
	canDelete?: boolean;
}) {
	return (
		<div>
			<h3>Here's your hilarious joke:</h3>
			<p>{joke.content}</p>
			<Link to=".">{joke.name} Permalink</Link>
			{
				isOwner ? (
					<Form method="post">
						<input
							type="hidden"
							name="_method"
							value="delete"
						/>
						<button
							type="submit"
							className="button"
							disabled={!canDelete}
						>
							Delete
						</button>
					</Form>
				) : null}
		</div>
	);
}
