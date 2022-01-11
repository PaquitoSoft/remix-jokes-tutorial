import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, json, redirect, useCatch, useTransition, Link, Form } from "remix";
import { db } from '~/utils/db.server';
import { requireUserId, getUserId } from '~/utils/session.server';
import { JokeDisplay } from '~/components/joke';

function NewJokeRoute() {
	const actionData = useActionData<ActionData>();
	const transition = useTransition();

	if (transition.submission) {
		const name = transition.submission.formData.get('name');
		const content = transition.submission.formData.get('content');

		if (
			typeof name === 'string' &&
			typeof content === 'string' &&
			!validateJokeContent(content) &&
			!validateJokeName(name)
		) {
			return (
				<JokeDisplay
					joke={{ name, content }}
					isOwner={true}
					canDelete={false}
				/>
			);
		}
		
	}

	return (
		<div>
			<h2>Add your own hilarious joke</h2>
			<Form method="post">
				<div>
					<label>
						Name:&nbsp;
						<input
							type="text"
							name="name"
							defaultValue={actionData?.fields?.name}
							aria-invalid={
								Boolean(actionData?.fieldErrors?.name) || undefined
							}
							aria-describedby={
								actionData?.fieldErrors?.name ? 'name-error' : undefined
							}
						/>
					</label>
					{
						actionData?.fieldErrors?.name ? (
							<p
								className="form-validation-error"
								role="alert"
								id="name-error"
							>{actionData.fieldErrors.name}</p>
						) : null
					}
				</div>
				<div>
					<label>
						Content:&nbsp;
						<textarea
							name="content"
							defaultValue={actionData?.fields?.content}
							aria-invalid={
								Boolean(actionData?.fieldErrors?.content) ||
								undefined
							}
							aria-describedby={
								actionData?.fieldErrors?.content
								? "content-error"
								: undefined
							}
						/>
					</label>
					{
						actionData?.fieldErrors?.content ? (
							<p
								className="form-validation-error"
								role="alert"
								id="content-error"
							>
								{actionData.fieldErrors.content}
							</p>
						) : null
					}
				</div>
				<div>
					<button type="submit" className="button">
						Add
					</button>
				</div>
			</Form>
		</div>
	);
}

export function ErrorBoundary() {
	return (
		<div className="error-container">
			Something unexpected went wrong. Sorry about that.
		</div>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	if (caught.status === 401) {
		return (
			<div className="error-container">
				<p>You must be logged in to create a joke.</p>
				<Link to="/login">Login</Link>
			</div>
		);
	}
}

export const loader: LoaderFunction = async ({ request }) => {
	const userId = await getUserId(request);

	if (!userId) {
		throw new Response('Unauthorized', { status: 401 });
	}

	return {};
};

function validateJokeContent(content: string) {
	if (content.length < 10) {
		return 'That joke is too short';
	}
}

function validateJokeName(name: string) {
	if (name.length < 3) {
		return 'That joke name is too short';
	}
}

type ActionData = {
	formError?: string;
	fieldErrors?: {
		name: string | undefined;
		content: string | undefined;
	};
	fields?: {
		name: string;
		content: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request);
	const form = await request.formData();
	const name = form.get('name');
	const content = form.get('content');

	// we do this type check to be extra sure and to make TypeScript happy
	// we'll explore validation next!
	if (typeof name !== 'string' || typeof content !== 'string') {
		// throw new Error('Invalid joke data submitted.');
		return badRequest({
			formError: 'Invalid joke data submitted.'
		});
	}

	const fields = { name, content };
	const fieldErrors = {
		name: validateJokeName(name),
		content: validateJokeContent(content)
	};

	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({
			fieldErrors, fields
		});
	}

	const joke = await db.joke.create({
		data: { ...fields, jokesterId: userId }
	});

	return redirect(`/jokes/${joke.id}`);
};

export default NewJokeRoute;
