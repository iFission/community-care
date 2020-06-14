# SCDF-IBM Lifesavers' Innovation Challenge 2020
<p align="center"> <img src="https://i.imgur.com/2jWhRY9.png" width=200></p>


## Short Description
Currently, responses to accidents are triggered by active calls to first responders. In the event of an unforeseen accident and the victim is not able to reach their phone or emergency device, it could prove lethal. Our solution addresses these unforeseen incidents through the use of non-intrusive IoT sensors and the IBM tech stack to engage Community First Responders to streamline and augment the aid process. Since we are using IoT sensors, we are able to generate passive alerts that do not require the intervention of the potential victim.

## Getting Started

Our application stack (frontend and backend) has been fully deployed using the **IBM Cloud Platform**. 

WebApp : https://community-care.mybluemix.net/
Node-red link: https://node-red-tuecs.mybluemix.net/red/#flow/146b94e0.b75fcb

Make sure to `allow GPS location` on runtime for the webApp :)

### Running on local environment instructions
1. Proceed to copy over and change directory to `client-web-app`
2. Open `index.html` using any modern browser 
3. Enjoy the app! 

### Porting over our flows to your node-red instance
Our flows are also available via the following directories
1. IoT Sensors flow  `community-care/home-sensors`
2. Server flow `commnunity-care/server`
3. Twilio flow `community-care/twillio-call`

To import these flows into your own node-red instances in **IBM Cloud Platform**

Proceed to `file>import>library` and select the relevant flows required.


## Pitch Video


## Architecture of Proposed Solution
![](https://i.imgur.com/n1zjwBu.png)


## Detailed Report

## Tech Stack
**IBM Tech**
* IBM IoT platform
* IBM Node RED
* IBM Cloudant
* IBM Twilio
* IBM CloudFoundry

**Other Tech**
* LeafletJS
* SG OneMap API



