import type { LoaderFunction } from 'remix';
import { Link, useLoaderData, useCatch } from 'remix';
import type { Joke } from '@prisma/client';
import { db } from '~/utils/db.server';

function JokesIndexRoute() {
	const data = useLoaderData<LoaderData>();
	return (
		<div>
			<p>Here is a random joke:</p>
			<p>{data.randomJoke.content}</p>
			<Link to={data.randomJoke.id}>
				"{data.randomJoke.name}" Permalink
			</Link>
		</div>
	);
}

export function ErrorBoundary() {
	return (
		<div className="error-container">
			I did a whoopsies.
		</div>
	);
}

type LoaderData = { randomJoke: Joke };

export const loader: LoaderFunction = async () => {
	const count = await db.joke.count();
	const randomJokeNumber = Math.floor(Math.random() * count);
	const [randomJoke] = await db.joke.findMany({
		take: 1,
		skip: randomJokeNumber
	});

	if (!randomJoke) {
		if (!randomJoke) {
			throw new Response('No random joke found.', { status: 404 });
		}
	}

	const data: LoaderData = { randomJoke };
	return data;
};

export function CatchBoundary() {
	const caught = useCatch();
	
	if (caught.status === 404) {
		return (
			<div className="error-container">
				There are no jokes to display.
			</div>
		);
	}

	throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export default JokesIndexRoute;
