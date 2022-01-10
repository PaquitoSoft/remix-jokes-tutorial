import {
	LiveReload,
	Outlet,
	Links,
	LinksFunction
} from "remix";

import globalStylesUrl from './styles/global.css';
import globalMediumStylesUrl from './styles/global-medium.css';
import globalLargeStylesUrl from './styles/global-large.css';

function App() {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<title>Remix: So great, it's funny!</title>
				<Links />
			</head>
			<body>
				<Outlet />
				{process.env.NODE_ENV === "development" && <LiveReload />}
			</body>
		</html>
	);
}

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: globalStylesUrl },
		{ rel: 'stylesheet', href: globalMediumStylesUrl, media: 'print, (min-width: 640px)' },
		{ rel: 'stylesheet', href: globalMediumStylesUrl, media: 'screen and (min-width: 1024px)' }
	];
}

export default App;
