const promptPDFUpload = async () => {
	try {
		// Prompt the user to select a PDF file
		const [fileHandle] = await window.showOpenFilePicker({
			multiple: false,
			types: [
				{
					description: "PDF Files",
					accept: {
						"application/pdf": [".pdf"],
					},
				},
			],
		});

		// Get the selected file
		const file = await fileHandle.getFile();

		// Check if it's a PDF file
		if (file.type !== "application/pdf") {
			throw new Error("Selected file is not a PDF");
		}

		return file;
	} catch (error) {
		console.error("Error during file upload or conversion:", error);
		return Promise.reject(error); // Reject the promise in case of error
	}
};

/**
 * @returns {import('@haelp/schedule-parse').APIRes}
 */
export const getSchedule = async (semester) => {
	if (semester !== 1 && semester !== 2) throw new Error("invalid semsester");
	const pdf = await promptPDFUpload();
	const form = new FormData();
	form.set("schedule", pdf);
	form.set("semester", semester.toString());

	const res = await (
		await fetch("https://api.haelp.dev/schedule/v1", {
			method: "POST",
			body: form,
		})
	).json();
	if (!res.success) throw res.error;
	return res.data;
};
