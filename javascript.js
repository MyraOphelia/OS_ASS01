// Function to generate process input fields dynamically
function generateProcessFields() {
    const numProcesses = document.getElementById('numProcesses').value;
    const processFields = document.getElementById('processFields');
    processFields.innerHTML = '';

    for (let i = 0; i < numProcesses; i++) {
        processFields.innerHTML += `
            <div>
                <h3>Process P${i}</h3>
                <label>Arrival Time:</label>
                <input type="number" name="arrivalTime${i}" required>
                <label>Burst Time:</label>
                <input type="number" name="burstTime${i}" required>
                <label>Priority:</label>
                <input type="number" name="priority${i}" required>
            </div>
        `;
    }
}

// Event listener to toggle required field for Time Quantum
document.getElementById('algorithm').addEventListener('change', function() {
    const quantumInput = document.getElementById('quantum');
    const selectedAlgorithm = this.value;
    
    if (selectedAlgorithm === 'roundRobin') {
        quantumInput.required = true; // Make quantum input required
    } else {
        quantumInput.required = false; // Make quantum input optional
    }
});

// Event listener for form submission
document.getElementById('processForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent form submission

    // Check for form validity
    if (!this.checkValidity()) {
        alert("Please fill in all required fields.");
        return;
    }

    // Collect the form data
    const numProcesses = document.getElementById('numProcesses').value;
    const quantum = document.getElementById('quantum').value;
    const algorithm = document.getElementById('algorithm').value;
    const processes = [];

    for (let i = 0; i < numProcesses; i++) {
        const arrivalTime = document.querySelector(`[name="arrivalTime${i}"]`).value;
        const burstTime = document.querySelector(`[name="burstTime${i}"]`).value;
        const priority = document.querySelector(`[name="priority${i}"]`).value;

        processes.push({
            id: `P${i}`,
            arrivalTime: parseInt(arrivalTime),
            burstTime: parseInt(burstTime),
            priority: parseInt(priority),
            remainingBurstTime: parseInt(burstTime) // Track remaining burst time
        });
    }

    // Call the simulation logic
    simulateScheduling(processes, quantum, algorithm);
});

// Function to simulate scheduling and display results
function simulateScheduling(processes, quantum, algorithm) {
    console.log("Processes: ", processes);
    console.log("Quantum: ", quantum);
    console.log("Algorithm: ", algorithm);

    // Sort processes based on the arrival time first (FCFS assumption)
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    let ganttData = [];
    let currentTime = 0;
    let queue = [...processes];
    let completed = [];

    // Round Robin scheduling simulation
    if (algorithm === 'roundRobin') {
        let currentProcessIndex = 0;
        while (queue.length > 0) {
            const process = queue[currentProcessIndex];

            // Execute the process for a time slice based on Time Quantum
            const timeSlice = Math.min(process.remainingBurstTime, quantum);
            ganttData.push({
                id: process.id,
                start: currentTime,
                end: currentTime + timeSlice,
            });

            currentTime += timeSlice;
            process.remainingBurstTime -= timeSlice;

            if (process.remainingBurstTime > 0) {
                // If the process is not finished, add it back to the queue
                queue.push(process);
            } else {
                completed.push(process);
            }

            // Remove the executed process from the front of the queue
            queue.shift();

            // Loop back to the start of the queue if needed
            if (queue.length > 0) {
                currentProcessIndex = queue.findIndex(p => p.arrivalTime <= currentTime); // Find next process to execute
            }
        }
    }

    // Generate Gantt Chart (Timeline) as blocks
    const ganttChart = document.getElementById('ganttChart');
    ganttChart.innerHTML = '';  // Clear previous chart
    ganttData.forEach(entry => {
        const block = document.createElement('div');
        block.classList.add('block');
        block.style.width = (entry.end - entry.start) * 30 + 'px'; // Width proportional to time
        block.innerHTML = entry.id;
        ganttChart.appendChild(block);
    });

    // Generate Gantt Chart Table (timeline)
    const ganttChartTable = document.getElementById('ganttChartTable');
    ganttChartTable.innerHTML = '';  // Clear previous table
    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>Process</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration</th>
        </tr>
    `;

    ganttData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.id}</td>
            <td>${entry.start}</td>
            <td>${entry.end}</td>
            <td>${entry.end - entry.start}</td>
        `;
        table.appendChild(row);
    });

    ganttChartTable.appendChild(table);

    // Generate Results Table
    const resultsTable = document.getElementById('resultsTable');
    resultsTable.innerHTML = '';  // Clear previous table
    const resultTable = document.createElement('table');
    resultTable.innerHTML = `
        <tr>
            <th>Process</th>
            <th>Turnaround Time</th>
            <th>Waiting Time</th>
        </tr>
    `;

    completed.forEach(process => {
        const turnaroundTime = currentTime - process.arrivalTime;
        const waitingTime = turnaroundTime - process.burstTime;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${process.id}</td>
            <td>${turnaroundTime}</td>
            <td>${waitingTime}</td>
        `;
        resultTable.appendChild(row);
    });
    resultsTable.appendChild(resultTable);
}
