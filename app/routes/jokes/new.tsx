function NewJokesRoute() {
	return (
		<div>
			<h2>Add your own hilarious joke</h2>
			<form action="" method="post">
				<div>
					<label>
						Name: <input type="text" name="name" />
					</label>
				</div>
				<div>
					<label>
						Content: <textarea name="content" />
					</label>
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

export default NewJokesRoute;
