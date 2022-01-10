import {
	LiveReload,
	Outlet,
	Links,
	LinksFunction
} from "remix";

import globalStylesUrl from './styles/global.css';
import globalMediumStylesUrl from './styles/global-medium.css';
import globalLargeStylesUrl from './styles/global-large.css';

function Document(
	{ children, title = 'Remix: So great, it\'s funny!' }:
	{ children: React.ReactNode, title?: string }
) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<title>{title}</title>
				<Links />
			</head>

			<body>
				{children}
				{process.env.NODE_ENV === "development" && <LiveReload />}
			</body>
		</html>
	);
}

function App() {
	return (
		<Document>
			<Outlet />
		</Document>
	);
}

export function ErrorBoundary({ error }: { error: Error }) {
	return (
		<Document title="Ouch!">
			<div className="error-container">
				<h1>App Error</h1>
				<pre>{error.message}</pre>
			</div>
		</Document>
	);
};

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: globalStylesUrl },
		{ rel: 'stylesheet', href: globalMediumStylesUrl, media: 'print, (min-width: 640px)' },
		{ rel: 'stylesheet', href: globalLargeStylesUrl, media: 'screen and (min-width: 1024px)' }
	];
}

export default App;
