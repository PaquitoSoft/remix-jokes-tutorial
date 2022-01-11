import { ActionFunction, LoaderFunction, redirect, useParams } from 'remix';
import { Link, useLoaderData, useCatch } from 'remix';
import type { Joke } from '@prisma/client';
import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';

function JokeRoute() {
	const data = useLoaderData<LoaderData>();

	return (
		<div>
			<h3>Here is your hilarious joke:</h3>
			<p>{data.joke.content}</p>
			<Link to=".">{data.joke.name} Permalink</Link>

			{
				data.isOwner && (
					<form method="post">
						<input
							type="hidden"
							name="_method"
							value="delete"
						/>
						<button type="submit" className="button">Delete</button>
					</form>
				)
			}
		</div>
	);
}

export function ErrorBoundary() {
	const { jokeId } = useParams();
	return (
		<div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
	);
}

export function CatchBoundary() {
	const caught = useCatch();
	const params = useParams();

	switch (caught.status) {
		case 404:
			return (
				<div className="error-container">
					Huh? What the heck is {params.jokeId}?
				</div>
			);
		case 401:
			return (
				<div className="error-container">
					Sorry, but {params.jokeId} is not your joke.
				</div>
			);
		default:
			return new Error(`Unhandled error: ${caught.status}`);
	}
	
}

type LoaderData = { joke: Joke, isOwner: boolean };

export const loader: LoaderFunction = async ({ request, params }) => {
	const userId = await getUserId(request);
	const joke = await db.joke.findUnique({ where: { id: params.jokeId } });

	if (!joke) {
		throw new Response('What a joke! Not found.', { status: 404 });
	}

	const data: LoaderData = { joke, isOwner: userId === joke.jokesterId };
	return data;
};

export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();

	if (form.get('_method') === 'delete') {
		const userId = await requireUserId(request);
		const joke = await db.joke.findUnique({ where: { id: params.jokeId } });

		if (!joke) {
			throw new Response('Joke to delete! Not found.', { status: 404 });
		}

		if (joke.jokesterId !== userId) {
			throw new Response('You cannot delete this joke.', { status: 401 });
		}

		await db.joke.delete({ where: { id: params.jokeId } });

		return redirect('/jokes');
	}
};

export default JokeRoute;
