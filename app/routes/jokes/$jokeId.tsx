import type { ActionFunction, LoaderFunction, MetaFunction } from 'remix';
import { useLoaderData, useCatch, redirect, useParams } from 'remix';
import type { Joke } from '@prisma/client';
import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';
import { JokeDisplay } from '~/components/joke';

function JokeRoute() {
	const data = useLoaderData<LoaderData>();

	return (
		<div>
			<JokeDisplay joke={data.joke} isOwner={data.isOwner} />
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

export const meta: MetaFunction = ({ data }: { data: LoaderData | undefined }) => {
	if (!data) {
		return {
			title: 'No joke',
			description: 'Joke not found'
		};
	}

	return {
		title: `"${data.joke.name}" joke` ,
		description: `Enjoy the "${data.joke.name}" joke and much more`
	};
};

export default JokeRoute;
