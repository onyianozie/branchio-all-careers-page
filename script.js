/*================================ VARIABLES ==============================*/

let arrJobs = [];
let arrDept = [];
let objRegion = {};
let objLocation = {};
function init() {
    fetchJobs();
}


/*================================ FETCH JOBS FROM API ==============================*/


function fetchJobs() {
    fetch('https://boards-api.greenhouse.io/v1/boards/branchmetrics/jobs')
    .then(function(response){
        return response.json(); 
    })
    .then(function(jsonResult){
        console.log('Working!', jsonResult);
        arrJobs = jsonResult.jobs;

        //* Loop through the array of jobs

        arrJobs.forEach(job => {
            if(job.location && job.location.name) {
                let arrLoc = job.location.name.split(",");
                if(arrLoc.length >= 3) {
                    let country = arrLoc[arrLoc.length -1].trim();
                    let loc = "";
                    for(let i = 0; i < arrLoc.length - 1; i++) {
                        loc += ", " + arrLoc[i];
                    }
                    loc = loc.substring(2);
                    if(!objRegion[country]) {
                        objRegion[country] = {label: country,value: country,loc: []};
                    }
                    if(!objLocation[loc]) {
                        objLocation[loc] = {label: loc,value: loc};
                        objRegion[country].loc.push({label: loc,value: loc});
                    }
                    job.region = country;
                    job.loc = loc;
                }
               
            }
        });
        fetchDepartment();
        
    });
}

/*================================ FETCH DEPARTMENTS FROM API ==============================*/

function fetchDepartment() { 
    fetch('https://boards-api.greenhouse.io/v1/boards/branchmetrics/departments')
        .then(function(response){
            return response.json(); 
        })
        .then(function(jsonRes){
            console.log('Working!', jsonRes);
            arrDept = jsonRes.departments;

            //* Loop through the array of departments

            jsonRes.departments.forEach(dept => {
                if(dept.jobs && dept.jobs.length) {
                    let arrJobID = [];
                    dept.jobs.forEach(job => {
                        arrJobID.push(job.internal_job_id);
                    });
                    arrJobs.forEach(job => {
                        if(arrJobID.includes(job.internal_job_id)) {
                            job.dept = dept; 
                        }
                    });
                }
            });
            populateDeptDropdown();
            populateRegionDropdown();
            populateJobs();
        });
}

/*================================ FILTER DROPDOWN ==============================*/

function populateDeptDropdown() {
    let department = document.getElementById("department");
    department.innerHTML = "";
    let option = document.createElement("option");
    option.text = "All Departments";
    option.value = -1;
    department.add(option);
    arrDept.forEach(dept => {
        option = document.createElement("option");
        option.text = dept.name;
        option.value = dept.id;
        department.add(option);
    });
}

function populateRegionDropdown() {
    let region = document.getElementById("region");
    region.innerHTML = "";
    let option = document.createElement("option");
    option.text = "All Regions";
    option.value = "-1";
    region.add(option);
    Object.keys(objRegion) .forEach(regKey => {
        let reg = objRegion[regKey];
        option = document.createElement("option");
        option.text = reg.label;
        option.value = reg.value;
        region.add(option);
    });
}

/*================================ ON CHANGE EVENTS ==============================*/

function onChangeDepartment(event) {
    populateJobs();
}

function onChangeRegion(event) {
    let region = document.getElementById("region");
    let reg = region.value;
    if(objRegion[reg] && objRegion[reg].loc && objRegion[reg].loc.length) {
        var arrLoc = objRegion[reg].loc;
        populateLocationDropdown(arrLoc);
    }
    else  {
        populateLocationDropdown([]);
    }
    populateJobs();
}

function populateLocationDropdown(arrLoc) {
    let location = document.getElementById("location");
    location.innerHTML = "";
    let option = document.createElement("option");
    option.text = "All Locations";
    option.value = "-1";
    location.add(option);
    arrLoc .forEach(loc => {
        option = document.createElement("option");
        option.text = loc.label;
        option.value = loc.value;
        location.add(option);
    });
}

function onChangeLocation(event) {
    populateJobs();
}

function populateJobs() {
    let department = document.getElementById("department");
    let deptID = parseInt(department.value,10);
    let region = document.getElementById("region");
    let reg = region.value;
    let location = document.getElementById("location");
    let loc = location.value;
    let arrData = [...arrJobs];
    if(deptID > -1) {
        arrData = arrData.filter(job => {
            return (job?.dept?.id === deptID);
        });
    }
    if(reg != "-1") {
        arrData = arrData.filter(job => {
            return (job?.region == reg);
        });
    }
    if(loc != "" && loc != "-1") {
        arrData = arrData.filter(job => {
            return (job?.loc == loc);
        });
    }
    var jobList = document.getElementById("jobList");
    jobList.innerHTML = "";
    arrData.forEach(job => {
        jobList.innerHTML += renderJobItem(job);
    });
}

function renderJobItem(job) {
    var html = `<div href="" class="job" id="job">
    <div class="job-cont" id="job-cont">
      <h4 id="title">${job.title}</h4>
      <div class="sub-heading">
        <p class="department" id="department">${job?.dept?.name},</p>
        <pre> </pre>
        <p class="location" id="location">${job?.location?.name}</p>
      </div>  
    </div>
    <button class="Apply" id="primaryBtn"><a href="${job.absolute_url
    }">Apply Now</a></button>
  </div>`;
  return html;
}

function deptClicked(event,dept) {
    let department = document.getElementById("department");
    
    option.value = dept.id;
}

init();