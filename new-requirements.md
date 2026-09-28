TodoMVC for Micro Frontends
A micro frontends architecture can be built in many ways. Custom-crafted and tailored to your organization's specific needs or by following the rules of a specific micro frontends meta-framework. The final result is also affected by the technologies you choose and whether you want to render your application on the server and/or client.

Making good choices is not always easy. Being able to look at real-world code and examples helps everyone involved get a good understanding of your decisions and their implications.

The Tractor Store aims to be to micro frontends what TodoMVC was to the advent of JavaScript frameworks in the late 2000s: An awesome collection of different implementations for the same application. A valuable learning resource for people new to this topic, and also a good basis for advanced discussions.

What do all implementations have in common?
Detailpage
Team boundaries
The webshop is divided into three systems. Each owned by a dedicated team. The border placement is not important as long as the teams stay resposible for their features. Read more.

Features & content
From an end-users perspective, all implementations should look and work the same.

Framework-agnostic integration
Although it's common, that adjacent teams use the same technologies, they must be able to evolve or change their tech-stack independently.

Independent deployment
Teams must be able to develop, test and deliver new features without consulting other teams or touching their code.

Technological challenges
Technology stack combinations
Technology stack combinations
Seeing the same app implemented with different JavaScript frameworks was the fascinating core of TodoMVC. Here we zoom out one level and compare how micro frontends built with different tech-stacks can be integrated.

Shell or no shell
Shell or no shell
Having a central application shell is a popular pattern, but it's not a requirement for building a micro frontends applications. Building a decentralized setup of self-contained systems that adhere to a set of rules is as valid as a meta-framework based solution.

Server or client rendered
Server or client rendered
If you render your application on the server, the client or both has a huge impact on your architecture and the required integration techniques.

Communication patterns
Communication patterns
Browser events, event-bus, URL parameter, shared state, via server or through your application shell? There are many ways to implement inter-team communication across micro frontends.

Deployment technique
Deployment technique
The tractor store example is designed in a way that it can be deployed in a containerized, serverless or static way. There are also specialized micro frontend hosting platforms that solve specific architecture-related problems. Being able to compare different deployment variants for the same application is a valuable resource.

Shared UI components
Bonus: Shared UI components
The tractor store example can also be used to verify how a common design system can be implemented. In many projects, this is a core challenge when migrating to a micro frontends architecture. The "button" component is a suitable first candidate to unify.

Team Boundaries
The three teams and their missions and responsibilities inside the Tractor Store.

Team Explore
Mission
Help users explore the tractor portfolio and stores locations.

Responsibility
home, product lists, stores, recommendations

Team Decide
Mission
Help users decide what model tractor they should choose.

Responsibility
product page

Team Checkout
Mission
Guide users through the checkout process.

Responsibility
cart, checkout, thanks

Features
boundary toggle
Boundary Toggle
Boundaries can be toggled off and on. Use the application like an end-user or switch on boundaries to see feature-ownership.

walkthrough
Complete Online Shop
Homepage, category, stores, product detail, cart, checkout and thank you page are included.
header and footer
Header & Footer
Owned by Team Explore. The same across all pages. Except for the checkout page.

recommendations
Recommendations
Color-matched tractor suggestions. Based on product selection and shopping cart contents.

cart
Shopping Cart
Add and remove tractors. Minicart updates accordingly.

store picker
Forms example
Checkout address form with embedded store picker owned by explore.

thank you confetti
Confirmation Confetti
Celebration on success. External dependency powered.

Contribute
How to Contribute
Create a new repository
Pick an existing Tractor Store repository (e.g. blueprint or preact) and create your own repository based on it.
Choose framework, technique and implement
Use your desired frameworks and techniques to implement the Tractor Store. Make sure you catch all the features described above.
Describe your implementation
Explain your implementation in the README.md file. Fill out the specs table. Describe what may be different or special about your take on the Tractor Store.
Submit your implementation
Write us an email with a link to your repository and we'll add it to the list. Bonus points if you can provide a live demo.
