import createF1MVURLs from "./f1mv/createF1MVURLs";


export default async function initApp(){
    await createF1MVURLs();
    console.log("App initialized")
}