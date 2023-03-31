import LoadingScreen from "@/pages/LoadingScreen";

const Main = () => {

	const initApp = async () => {
		// code here
		await new Promise((resolve) => setTimeout(resolve, 1000));
	};

	initApp().then(() => {window.location.hash = "/home";});

	return (
		<LoadingScreen/>
	);
};

export default Main;