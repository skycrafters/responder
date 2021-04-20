module.exports = (action, flow) => {

	return new Promise((resolve, reject) => {

		console.log("Waiting %d seconds ...", action.duration);

		setTimeout(() => {

			console.log("... waited %d seconds", action.duration);
			resolve(true);

		}, action.duration * 1000)

	});

};
