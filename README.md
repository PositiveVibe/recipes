A Simple Recipe App built in React.

### General Design Considerations
I aimed to make the app as simple as possible. In terms of the UI, Material UI was chosen. Since the spec only asked for the ingredients to be listed, I ended up using a table to display the ingredients. I wanted to show a loading icon whenever the app was waiting for data from the server, to give a signal to the user and to prevent multiple submits.
I also added error text to indicate what needs to be changed if the user attempts to submit incorrect data.

### Time Spent
- 1 hour initial setup, verify api working, set up material ui
- 1 hour get API working without global variables
- 1 hour set up architecture to show all recipes vs 1 single recipe
- 1 hour send ingredients with recipe 
- 1 hour all recipes CSS (messing with grid then went to tiles).
- 2 hours getting the PATCH and DELETE options setup
- 1 hour getting the error text to show
- 1 hour getting the loading icon to show in all appropriate places
- 1 hour cleaning up code and small CSS tweaks

~10 hours total, maybe closer to 11 

### Additional Considerations
- Adding in the login/authentication tokens would have been nice to have, but I did not complete it. 
- Currently there is no routing, only internal state. I would like to add some routing so / and /recipe are different pages, allowing the user to hit the back button.
- If I were to do this again I would have structured the individual recipe page as a component rather than a function.  
- This was the first webApp I built in React, previously I have edited existing code and made an app with Expo.io (without needing to do routing).
- I actually learned a lot and could probably do this similar task in about half to 3/4 of the time were I to do it again. 

Thank you! 









This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.
