import ReactGA from "react-ga4";
import EffectEditor from "@/components/effect-editor/EffectEditor";
import NavBar from "@/components/navbar";

export default function EffectEditorPage(){
  ReactGA.send({ hitType: "pageview", page: "/effect-editor" });
  return (
    <div>
      <NavBar showBackButton={true} backButtonLocationHash={"/settings"}/>
      <h1>Effect Editor</h1>
      <EffectEditor/>
    </div>
  );
}