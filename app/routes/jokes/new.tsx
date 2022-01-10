import type { ActionFunction } from "remix";
import { useActionData, json, redirect } from "remix";
import { db } from '~/utils/db.server';

function NewJokesRoute() {
	const actionData = useActionData<ActionData>();

	return (
		<div>
			<h2>Add your own hilarious joke</h2>
			<form method="post">
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
			</form>
		</div>
	);
}

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

	const joke = await db.joke.create({ data: fields });

	return redirect(`/jokes/${joke.id}`);
};

export default NewJokesRoute;
