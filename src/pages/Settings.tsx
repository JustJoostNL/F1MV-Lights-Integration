import NavBar from "@/components/navbar";

export default function Main() {
    return (
        <div>
            <NavBar showSettingsBackButton={true} />
            <h1>Settings</h1>
        </div>
    )
}