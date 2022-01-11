import type { LinksFunction, ActionFunction, MetaFunction } from "remix";
import {
	Link,
	Form,
	useSearchParams,
	useActionData,
	json
} from "remix";
import { db } from "~/utils/db.server";
import { createUserSession, login, register } from "~/utils/session.server";

import stylesUrl from '~/styles/login.css';

function FormInput({ name, actionData }: { name: 'username' | 'password', actionData?: ActionData }) {
	return (
		<div>
			<label htmlFor={`${name}-input`}>{name}</label>
			<input
				type={name === 'password' ? 'password' : 'text'}
				id={`${name}-input`}
				name={name}
				defaultValue={actionData?.fields?.[name]}
				aria-invalid={Boolean(actionData?.fieldErrors?.[name])}
				aria-describedby={actionData?.fieldErrors?.[name] ? `${name}-error` : undefined}
			/>
			{
				actionData?.fieldErrors?.[name] ? (
					<p
						className="form-validation-error"
						role="alert"
						id={`${name}-error`}
					>
						{actionData?.fieldErrors[name]}
					</p>
				)
				: null
			}
		</div>
	)
}

function Login() {
	const [searchParams] = useSearchParams();
	const actionData = useActionData<ActionData>();

	return (
		<div className="container">
			<div className="content" data-light>
				<h1>Login</h1>
				<Form
					method="post"
					aria-describedby={actionData?.formError ? 'form-error-message' : undefined}
				>
					<input type="hidden" name="redirectTo" value={searchParams.get('redirectTo') ?? undefined} />

					<fieldset>
						<legend className="sr-only">
							Login or Register?
						</legend>
						<label>
							<input
								type="radio"
								name="loginType"
								value="login"
								defaultChecked={
									!actionData?.fields?.loginType ||
									actionData?.fields?.loginType === 'login'
								}
							/>&nbsp;Login
						</label>
						<label>
							<input
								type="radio"
								name="loginType"
								value="register"
								defaultChecked={actionData?.fields?.loginType === 'register'}
							/>&nbsp;Register
						</label>
					</fieldset>

					<FormInput name="username" actionData={actionData} />
					<FormInput name="password" actionData={actionData} />

					<div id="form-error-message">
						{
							actionData?.formError ? (
								<p
									className="form-validation-error"
									role="alert"
								>{actionData?.formError}</p>
							) : null
						}
					</div>
					<button type="submit" className="button">Submit</button>
				</Form>
			</div>

			<div className="links">
				<ul>
					<li>
						<Link to="/">Home</Link>
					</li>
					<li>
						<Link to="/jokes">Jokes</Link>
					</li>
				</ul>
			</div>
		</div>
	);
};

function validateUsername(username: unknown) {
	if (typeof username !== "string" || username.length < 3) {
		return `Usernames must be at least 3 characters long`;
	}
}

function validatePassword(password: unknown) {
	if (typeof password !== "string" || password.length < 6) {
		return `Passwords must be at least 6 characters long`;
	}
}

type ActionData = {
	formError?: string;
	fieldErrors?: {
		username: string | undefined;
		password: string | undefined;
	};
	fields?: {
		loginType: string;
		username: string;
		password: string;
	}
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
	const form = await request.formData();
	const loginType = form.get('loginType');
	const username = form.get('username');
	const password = form.get('password');
	const redirectTo = form.get('redirectTo') || '/jokes';

	if (
		typeof loginType !== "string" ||
		typeof username !== "string" ||
		typeof password !== "string" ||
		typeof redirectTo !== "string"
	) {
		return badRequest({
			formError: `Invalid form data submitted.`
		});
	}
	
	const fields = { loginType, username, password };
	const fieldErrors = {
		username: validateUsername(username),
		password: validatePassword(password)
	}

	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	switch (loginType) {
		case 'login':
			const user = await login({ username, password });
			console.log({ user });
			if (!user) {
				return badRequest({
					fields,
					formError: "Username/Password combination is incorrect"
				});	
			}
			// if there is a user, create their session and redirect to /jokes
			return createUserSession(user.id, redirectTo);
		case 'register':
			const userExists = await db.user.findFirst({ where: { username } });

			if (userExists) {
				return badRequest({
					fields,
					formError: `User ${username} already exists`
				});
			}

			// create the user
			// create their session and redirect to /jokes
			const newUser = await register({ username, password });
			if (!newUser) {
				return badRequest({
					fields,
					formError: "Something went wrong trying to create a new user."
				});
			}
			return createUserSession(newUser.id, redirectTo);
		default:
			return badRequest({
				fields,
				formError: 'Invalid login type'
			});
	}

};

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: stylesUrl }];
};

export const meta: MetaFunction = () => ({
	title: 'Remix Jokex | Login',
	description: 'Login to submit your own jokes to Remix Jokes!'
});

export default Login;
