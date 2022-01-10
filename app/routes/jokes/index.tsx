import type { LoaderFunction } from 'remix';
import { Link, useLoaderData } from 'remix';
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

type LoaderData = { randomJoke: Joke };

export const loader: LoaderFunction = async () => {
	const count = await db.joke.count();
	const randomJokeNumber = Math.floor(Math.random() * count);
	const [randomJoke] = await db.joke.findMany({
		take: 1,
		skip: randomJokeNumber
	});

	const data: LoaderData = { randomJoke };
	return data;
};

export default JokesIndexRoute;
