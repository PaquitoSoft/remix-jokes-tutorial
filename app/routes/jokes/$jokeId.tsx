import type { LoaderFunction } from 'remix';
import { Link, useLoaderData } from 'remix';
import type { Joke } from '@prisma/client';
import { db } from '~/utils/db.server';

function JokeRoute() {
	const data = useLoaderData<LoaderData>();

	return (
		<div>
			<h3>Here is your hilarious joke:</h3>
			<p>{data.joke.content}</p>
			<Link to=".">{data.joke.name} Permalink</Link>
		</div>
	);
}

type LoaderData = { joke: Joke };

export const loader: LoaderFunction = async ({ params }) => {
	const joke = await db.joke.findUnique({ where: { id: params.jokeId } });

	if (!joke) throw new Error('Joke not found');

	const data: LoaderData = { joke };
	return data;
};

export default JokeRoute;
