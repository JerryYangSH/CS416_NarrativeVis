Promise.all([
    d3.csv("data/total_cases.csv"),
    d3.csv("data/total_deaths.csv")
]).then((datasets) => {
    const [casesData, deathsData] = datasets;
    // Set up the dimensions of the chart
    const margin = {top: 20, right: 100, bottom: 30, left: 100};
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Convert string dates to actual date objects
    const dateParser = d3.timeParse("%Y-%m-%d");
    casesData.forEach((d) => {
        d.date = dateParser(d.date);
        d.cases = +d.World; // Convert to numbers
    });
    deathsData.forEach((d) => {
        d.date = dateParser(d.date);
        d.deaths = +d.World; // Convert to numbers
    });

    const data = casesData.map((caseRecord) => {
        const deathRecord = deathsData.find((d) => d.date.getTime() === caseRecord.date.getTime());
        return {
            date: caseRecord.date,
            cases: caseRecord.cases,
            deaths: deathRecord ? deathRecord.deaths : 0
        };
    });

    // Create an SVG element within the #chart div
    const svg = d3.select("#line-chart-cases")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create scales for x and y axes
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, (d) => d.date))
        .range([0, width]);

    const yScaleCases = d3.scaleLog()
        .domain([1, d3.max(data, (d) => d.cases)])
        .range([height, 0]);

    const yScaleDeaths = d3.scaleLog()
        .domain([1, d3.max(data, (d) => d.cases)]) // same range as cases so it looks consistent to compare
        .range([height, 0]);


    // Create x and y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxisCases = d3.axisLeft(yScaleCases);
    const yAxisDeaths = d3.axisLeft(yScaleDeaths);

    // Append x and y axes to the SVG
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .call(yAxisCases);

    svg.append("g")
        .attr("transform", "translate(" + width + " ,0)")
        .call(yAxisDeaths);

    // Create the line generators
    const lineCases = d3.line()
        .x((d) => xScale(d.date))
        .y((d) => yScaleCases(d.cases));

    const lineDeaths = d3.line()
        .x((d) => xScale(d.date))
        .y((d) => yScaleDeaths(d.deaths));

    // Append the lines to the SVG
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("d", lineCases);
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("d", lineDeaths);

    // Add tooltips
    const tooltipCases = d3.select("#line-chart-cases")
        .append("div")
        .attr("class", "tooltip-line-chart")
        .style("opacity", 0);

    const tooltipDeaths = d3.select("#line-chart-deaths")
        .append("div")
        .attr("class", "tooltip-line-chart")
        .style("opacity", 0);

    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 2)
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScaleCases(d.cases))
        .style("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltipCases.transition()
                .duration(200)
                .style("opacity", 1);
            tooltipCases.html("Date: " + d.date.toISOString().slice(0, 10) + "<br> Cases: " + d.cases)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) - 30 + "px");
        })
        .on("mouseout", () => {
            tooltipCases.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 2)
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScaleDeaths(d.deaths))
        .style("fill", "red")
        .on("mouseover", (event, d) => {
            tooltipCases.transition()
                .duration(200)
                .style("opacity", 1);
            tooltipCases.html("Date: " + d.date.toISOString().slice(0, 10) + "<br> Deaths: " + d.deaths)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) - 30 + "px");
        })
        .on("mouseout", () => {
            tooltipDeaths.transition()
                .duration(500)
                .style("opacity", 0);
        });
});

function clearup() {
    //d3.selectAll("svg > *").remove();
    d3.select("#bar-chart-cases-id").remove();
    d3.select("#bar-chart-deaths-id").remove();
    d3.select('#tooltip').style('opacity', 0);
}

/////////    BAR CHARTS  ///
Promise.all([
    d3.csv("data/total_cases.csv"),
    d3.csv("data/total_deaths.csv")
]).then((datasets) => {
    const [casesData, deathsData] = datasets;
    // Set up the dimensions of the chart
    const margin = {top: 20, right: 100, bottom: 80, left: 100};
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Convert string dates to actual date objects
    const dateParser = d3.timeParse("%Y-%m-%d");
    casesData.forEach((d) => d.date = dateParser(d.date));
    deathsData.forEach((d) => d.date = dateParser(d.date));

    // Get unique dates for date selection
    const uniqueDates = [...new Set(casesData.map(d => d.date))];

    // Create date selection bar
    const dateSelect = d3.select("#date-select");
    dateSelect.selectAll("option")
        .data(uniqueDates)
        .enter()
        .append("option")
        .text((d) => d.toISOString().slice(0, 10))
        .attr("value", (d) => d.toISOString().slice(0, 10));

    maxYCasesValue = 10000000;
    maxYDeathsValue = 1200000;
    maxYValue = maxYCasesValue;
    // These are not country names
    const excludedCountryNames = [
        "High income", "Low income", "Lower middle income",
        "Upper middle income",
        "Asia", "Europe",
        "European Union", "Africa", "South America",
        "North America",
        "Cook Islands"
    ];

    let currentGroupId = 0;
    // Function to update the cases bar chart based on the selected date
    function updateCasesChart(selectedDate, groupId) {
        const filteredCasesData = casesData.find(d => d.date.getTime() === selectedDate.getTime());
        const countries = Object.keys(filteredCasesData)
            .filter(d => d !== "date" && d !== "World" && !excludedCountryNames.includes(d))
            .sort((a, b) => b.value - a.value) // Sort by value
            .slice(50 * groupId, 50 * (groupId + 1));
        //console.log("[updateCasesChart]Number of Countries:" + countries.length + " groupId:" + groupId);

        const cases = countries.map(country => ({
            country: country,
            value: +filteredCasesData[country] || 0
        }));

        // Create scales for x and y axes
        const xScale = d3.scaleBand()
            .domain(countries)
            .range([0, width])
            .padding(0.01);

        const yScaleCases = d3.scaleLinear()
            .domain([1, maxYCasesValue])
            //.domain([0, d3.max(cases, d => d.value)])
            .range([height, 0]);

        // Create x and y axes
        const xAxisCases = d3.axisBottom(xScale);
        const yAxisCases = d3.axisLeft(yScaleCases);

        // Create SVG element for cases bar chart
        const svgCases = d3.select("#bar-chart-cases")
            .selectAll("svg")
            .data([null])
            .join("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("id", "bar-chart-cases-id");

        // Remove any existing bars
        svgCases.selectAll(".bar").remove();
        svgCases.selectAll(".x-axis").remove();
        svgCases.selectAll(".y-axis").remove();

        // Create bars for cases
        svgCases.selectAll(".bar")
            .data(cases)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.country))
            .attr("y", d => yScaleCases(d.value || 0))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScaleCases(d.value || 0))
            .attr("fill", "steelblue");

        // Add tooltips for cases bars
        svgCases.selectAll(".bar")
            .on("mouseover", (event, d) => {
                const tooltip = d3.select("#tooltip");
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`<strong>${d.country}</strong><br>Cases: ${d.value || 0}<br>Date: ${selectedDate.toLocaleDateString()}`)
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", () => {
                const tooltip = d3.select("#tooltip");
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Append x and y axes to the SVG for cases
        svgCases.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxisCases)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svgCases.append("g")
            .attr("class", "y-axis")
            .text("Value vs Date Graph")
            .call(yAxisCases);

        svgCases.append("text")
            .attr("x", width + margin.left / 2)
            .attr("y", 0)
            .style("text-anchor", "middle")
            .text(selectedDate.toLocaleDateString());
    }

    // Function to update the deaths bar chart based on the selected date
    function updateDeathsChart(selectedDate, groupId) {
        const filteredDeathsData = deathsData.find(d => d.date.getTime() === selectedDate.getTime());
        const countries = Object.keys(filteredDeathsData)
            .filter(d => d !== "date" && d !== "World" && !excludedCountryNames.includes(d))
            .sort((a, b) => b.value - a.value) // Sort by value
            .slice(50 * groupId, 50 * (groupId + 1));
        //console.log("[updateDeathsChart]Number of Countries:" + countries.length + " groupId:" + groupId);
        const deaths = countries.map(country => ({
            country: country,
            value: +filteredDeathsData[country] || 0
        }));

        // Create scales for x and y axes
        const xScale = d3.scaleBand()
            .domain(countries)
            .range([0, width])
            .padding(0.01);

        const yScaleDeaths = d3.scaleLinear()
            .domain([1, maxYDeathsValue])
            //.domain([0, d3.max(deaths, d => d.value)])
            .range([height, 0]);

        // Create x and y axes
        const xAxisDeaths = d3.axisBottom(xScale);
        const yAxisDeaths = d3.axisRight(yScaleDeaths);

        // Create SVG element for death bar chart
        const svgDeaths = d3.select("#bar-chart-deaths")
            .selectAll("svg")
            .data([null])
            .join("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("id", "bar-chart-deaths-id");

        // Remove any existing bars
        svgDeaths.selectAll(".bar").remove();
        svgDeaths.selectAll(".x-axis").remove();
        svgDeaths.selectAll(".y-axis").remove();

        // Create bars for deaths
        svgDeaths.selectAll(".bar")
            .data(deaths)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.country))
            .attr("y", d => yScaleDeaths(d.value || 0))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScaleDeaths(d.value || 0))
            .attr("fill", "red");

        // Add tooltips for cases bars
        svgDeaths.selectAll(".bar")
            .on("mouseover", (event, d) => {
                const tooltip = d3.select("#tooltip");
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`<strong>${d.country}</strong><br>Deaths: ${d.value || 0}<br>Date: ${selectedDate.toLocaleDateString()}`)
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", () => {
                const tooltip = d3.select("#tooltip");
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Append x and y axes to the SVG for cases
        svgDeaths.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxisDeaths)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svgDeaths.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + width + " ,0)")
            .call(yAxisDeaths);
    }

    // Set the default date
    let selectedDate = dateParser("2022-01-01");
    dateSelect.property("value", selectedDate.toISOString().slice(0, 10));

    // Initial update of the charts with the default date
    updateCasesChart(selectedDate, currentGroupId);
    updateDeathsChart(selectedDate, currentGroupId);

    // Add event listener to update the charts on date selection change
    dateSelect.on("change", function () {
        clearup();
        selectedDate = dateParser(this.value);
        updateCasesChart(selectedDate, currentGroupId);
        updateDeathsChart(selectedDate, currentGroupId);
    });

    d3.select("#group1-btn").on("click", function () {
        clearup();
        currentGroupId = 0;
        updateCasesChart(selectedDate, 0);
        updateDeathsChart(selectedDate, 0);
    });
    d3.select("#group2-btn").on("click", function () {
        clearup();
        currentGroupId = 1;
        updateCasesChart(selectedDate, 1);
        updateDeathsChart(selectedDate, 1);
    });
    d3.select("#group3-btn").on("click", function () {
        clearup();
        currentGroupId = 2;
        updateCasesChart(selectedDate, 2);
        updateDeathsChart(selectedDate, 2);
    });
    d3.select("#group4-btn").on("click", function () {
        clearup();
        currentGroupId = 3;
        updateCasesChart(selectedDate, 3);
        updateDeathsChart(selectedDate, 3);
    });
    d3.select("#group5-btn").on("click", function () {
        clearup();
        currentGroupId = 4;
        updateCasesChart(selectedDate, 4);
        updateDeathsChart(selectedDate, 4);
    });

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    let playing = false;
    let playInterval;
    d3.select("#play-btn").on("click", function () {
        if (playing) {
            clearInterval(playInterval);
            playing = false;
            this.textContent = "Play";
        } else {
            let START = dateParser("2020-01-05");;
            let END = dateParser("2024-07-07");;
            let curDate = selectedDate;
            playInterval = setInterval(function () {
                if (curDate < END) {
                    curDate = addDays(curDate, 1);
                } else {
                    curDate = START;
                }
                clearup();
                updateCasesChart(curDate, currentGroupId);
                updateDeathsChart(curDate, currentGroupId);
            }, 10);
            playing = true;
            this.textContent = "Pause";
        }
    });


});




