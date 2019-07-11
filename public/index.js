const signInButton = document.getElementById("sign-in");
const profile = document.getElementById("profile");

signInButton.addEventListener("click", async () => {
  auth0Client.signIn();
});

async function getCustomers() {
  const response = await fetch("http://localhost:3001/customers", {
    mode: "cors",
    headers: {
      Authorization: `Bearer ${auth0Client.getAccessToken()}`
    }
  });
  if (!response.ok) return false;
  return await response.json();
}

async function addCustomer(customerName) {
  const response = await fetch("http://localhost:3001/customers", {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({ name: customerName }),
    headers: {
      Authorization: `Bearer ${auth0Client.getAccessToken()}`,
      "Content-Type": "application/json"
    }
  });
  return response.ok ? true : false;
}

async function displayCustomerDetails() {
  const customers = await getCustomers();
  if (!customers) return;
  const main = document.getElementsByClassName("main")[0];
  const messageContainer = document.createElement("div");
  const cardContainer = document.createElement("div");
  const customerList = document.createElement(`ul`);
  messageContainer.className = `card m-4 w-50`;
  cardContainer.className = `card-header font-weight-bold text-center text-uppercase`;
  cardContainer.innerHTML = `Customers`;
  customerList.className = `list-group list-group-flush`;
  customers.data.forEach(value => {
    const customerListItem = document.createElement("li");
    customerListItem.className = `list-group-item`;
    customerListItem.innerHTML = value.name;
    customerList.append(customerListItem);
  });
  messageContainer.append(cardContainer);
  messageContainer.append(customerList);
  while (main.hasChildNodes()) {
    main.removeChild(main.firstChild);
  }
  main.append(messageContainer);
}

async function authorizeUser() {
  const response = await fetch("http://localhost:3001/authorize", {
    method: "POST",
    mode: "cors",
    headers: {
      Authorization: `Bearer ${auth0Client.getAccessToken()}`
    }
  });
  if (!response.ok) return;
  const data = await response.json();
  signInButton.style.display = "none";
  profile.innerText = `Hello, ${auth0Client.getProfile().name}`;
  profile.classList.add("bg-light");
  // The permissions data on the authorized user determines what functionality they'll be allowed to perform
  data.user.permissions.forEach(permission => {
    // e.g permission = 'read:customers'
    // Parse the permission data by seperating the values on either side of the colon
    const colonIndex = permission.indexOf(":");
    const permissionRole = permission.slice(0, colonIndex); // e.g read
    const permissionName = permission.slice(colonIndex + 1); // e.g customers
    // Update the UI with the functionalities available to this User
    const messageContainer = document.createElement("div");
    messageContainer.className =
      "font-weight-bold bg-primary p-2 mt-2 mb-2 rounded text-capitalize";
    messageContainer.setAttribute("id", `${permissionRole}${permissionName}`);
    messageContainer.innerText = `${permissionRole} Customer Details`;
    signInButton.after(messageContainer);
  });
}

(async () => {
  const loggedInThroughCallback = await auth0Client.handleCallback();
  if (loggedInThroughCallback) {
    await authorizeUser();
    await displayCustomerDetails();
    const viewCustomerDetailsButton = document.getElementById("readcustomers");
    const createCustomerButton = document.getElementById("createcustomers");
    createCustomerButton.addEventListener("click", async () => {
      // Line 95 - 118 Simply Creates a form and displays it on the UI
      // We'll use the form to add/create a new Customer
      const main = document.getElementsByClassName("main")[0];
      const container = document.createElement("div");
      const formContainer = document.createElement("form");
      const formElementsContainer = document.createElement("div");
      const formInput = document.createElement("input");
      const submitButton = document.createElement("button");
      container.className = "w-50 m-4";
      formContainer.setAttribute("id", "createCustomer");
      formElementsContainer.className = "form-group";
      formInput.className = "form-control";
      formInput.setAttribute("id", "customerName");
      formInput.setAttribute("type", "name");
      formInput.setAttribute("placeholder", "Enter Customer Name");
      submitButton.setAttribute("type", "submit");
      submitButton.className = "btn";
      submitButton.innerText = "Submit";
      formElementsContainer.append(formInput);
      formContainer.append(formElementsContainer);
      formContainer.append(submitButton);
      container.append(formContainer);
      while (main.hasChildNodes()) {
        main.removeChild(main.firstChild);
      }
      main.append(container);

      // When the form is submitted,  we'll send the details over to our API to be added to our fake database
      // and then we'll display the updated customer list on the UI
      formContainer.addEventListener("submit", async e => {
        e.preventDefault();
        const customerName = document.getElementById("customerName").value;
        await addCustomer(customerName);
        await displayCustomerDetails();
        return false;
      });
    });
    viewCustomerDetailsButton.addEventListener("click", async () => {
      await displayCustomerDetails();
    });
  }
})();
