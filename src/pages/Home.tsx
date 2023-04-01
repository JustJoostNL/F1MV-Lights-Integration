import NavBar from "@/components/navbar";
import SimulationMenu from "@/components/simulations";

export default function Main() {
	return (
		<div>
			<NavBar showSettingsBackButton={false} />
			<SimulationMenu />
		</div>
	);
}