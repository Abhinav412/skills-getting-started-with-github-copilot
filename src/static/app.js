document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  async function fetchActivities() {
    const response = await fetch("/activities");
    const activities = await response.json();

    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    Object.entries(activities).forEach(([name, details]) => {
      const card = document.createElement("div");
      card.className = "activity-card";
      card.innerHTML = `
        <h4></h4>
        <p></p>
        <p><strong>Schedule:</strong> </p>
        <p><strong>Availability:</strong> ${details.max_participants - details.participants.length} spots left</p>
        <div class="participants"><strong>Participants</strong></div>
      `;

      card.querySelector("h4").textContent = name;
      card.querySelector("p").textContent = details.description;
      card.querySelectorAll("p")[1].append(details.schedule);

      const participants = document.createElement("ul");
      participants.className = "participants-list";

      details.participants.forEach((email) => {
        const item = document.createElement("li");
        const label = document.createElement("span");
        const button = document.createElement("button");

        label.textContent = email;
        button.textContent = "🗑️";
        button.type = "button";
        button.className = "delete-participant";
        button.dataset.activity = name;
        button.dataset.email = email;
        button.setAttribute("aria-label", `Unregister ${email}`);

        item.append(label, button);
        participants.appendChild(item);
      });

      card.querySelector(".participants").appendChild(
        details.participants.length
          ? participants
          : Object.assign(document.createElement("p"), {
              className: "no-participants",
              textContent: "No participants yet.",
            })
      );

      activitiesList.appendChild(card);

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
  }

  activitiesList.addEventListener("click", async (event) => {
    const button = event.target.closest(".delete-participant");
    if (!button) return;

    const response = await fetch(
      `/activities/${encodeURIComponent(button.dataset.activity)}/signup?email=${encodeURIComponent(button.dataset.email)}`,
      { method: "DELETE" }
    );
    const result = await response.json();

    messageDiv.textContent = result.message || result.detail;
    messageDiv.className = response.ok ? "success" : "error";
    messageDiv.classList.remove("hidden");

    if (response.ok) await fetchActivities();
  });

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = activitySelect.value;
    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
      { method: "POST" }
    );
    const result = await response.json();

    messageDiv.textContent = result.message || result.detail;
    messageDiv.className = response.ok ? "success" : "error";
    messageDiv.classList.remove("hidden");

    if (response.ok) {
      signupForm.reset();
      await fetchActivities();
    }
  });

  fetchActivities();
});
