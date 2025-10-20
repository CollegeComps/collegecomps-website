1. Landing Page & Core Sorting
Task: Refactor Landing Page Default View
Prompt: /task Refactor the college list landing page. Remove the current alphabetical list view as the default. Instead, implement a new default view that displays colleges sorted by 'implied ROI' in descending order (highest ROI first).

Task: Implement 'Implied ROI' Calculation
Prompt: /task Create a backend function to calculate 'implied ROI' for each college. Add this as a new, queryable field to the college model.

Developer Note: This directly addresses your question about data. The ability to calculate ROI depends entirely on the data you have. This task assumes you can create a formula (e.g., (Median_Earnings / Average_Cost) = ROI). If you are missing 'median earnings' or 'average cost' data, you'll need to add those data pipeline tasks first (see section 4).

Follow-up Question: What is the specific formula we should use for 'implied ROI'?

2. New Filtering Features
Task: Implement Zip Code Proximity Filter
Prompt: /task Add a new filter component to the college list UI. This component should accept a 5-digit zip code as input.

Prompt: /task Implement the backend logic for the zip code filter. When a zip code is provided, the API should calculate the distance between that zip code and each college's location. Return the college list sorted by distance, from nearest to farthest. This will likely require adding latitude/longitude data to the college model.

Task: Implement Major Category Filter
Prompt: /task Add a new dropdown or multi-select filter to the UI labeled 'Major Category' with the following options: STEM, Humanities, Social Sciences, Arts, Business, Health, and Education.

Prompt: /task Create a mapping function or utility. This function needs to map the detailed 'majors' already in our database to one of the new high-level categories (e.g., map 'Computer Science' and 'Biology' to 'STEM').

Prompt: /task Update the college list API to accept a 'major_category' parameter and filter the results based on the mapping created in the previous task.

3. Scholarship Matching Feature
Task: Create Scholarship Lead-Gen Form
Prompt: /task Create a new page or modal for 'Scholarship Matching'. This UI should contain a form that captures student profile information (e.g., Full Name, Email, Phone, High School GPA, Desired Major, State of Residence).

Prompt: /task Create a new API endpoint to handle the submission of the scholarship form. The endpoint should save the student's contact info and profile data to a 'leads' or 'students' table in the database.

Task: Implement Scholarship Matching Logic
Prompt: /task (Depends on data) Create a 'Scholarship' model and database table. This will store scholarship data (e.g., name, amount, requirements like min_gpa, major, state).

Prompt: /task After the student submits their profile, implement backend logic to query the 'Scholarships' table. The query should match the student's profile (GPA, major, state) against the scholarship requirements. Display the list of matching scholarships on a results page.

4. New Data Model Additions
To answer your data questions: Yes, it is possible to add all these data points. "Median earnings 10 years after enrollment" is a standard field available from the U.S. Department of Education's College Scorecard dataset, which is a great source for this and for acceptance rates.

Task: Add Academic & Athletic Data
Prompt: /task Modify the 'College' database schema and data model. Add new fields for: 'average_sat' (Integer), 'average_act' (Integer), and 'athletic_conference' (String).

Prompt: /task Create or update the data ingestion script to source and populate these new 'average_sat', 'average_act', and 'athletic_conference' fields for all colleges in the database.

Task: Add Acceptance Rate & Median Earnings Data
Prompt: /task Modify the 'College' database schema and data model. Add new fields for: 'acceptance_rate' (Decimal/Float) and 'median_earnings_10yr' (Integer).

Prompt: /task Create a new data pipeline to fetch and ingest 'acceptance_rate' and 'median_earnings_10yr' for all colleges. Use the U.S. Department of Education's College Scorecard dataset API as the data source.

5. College Match Questionnaire Enhancement
Task: Enhance College Match Questionnaire UI
Prompt: /task Update the 'College Match' questionnaire form. Add new required input fields for: 'high_school_gpa' (Decimal), 'sat_score' (Integer), 'act_score' (Integer), 'student_income' (Integer), 'parent_income' (Integer), and 'parent_assets' (Integer).

Task: Update College Match Backend
Prompt: /task Update the 'College Match' API endpoint to accept the new fields (GPA, SAT/ACT, income, assets) and save them to the student's profile.

Prompt: /task Refactor the 'College Match' recommendation algorithm. The algorithm should now heavily weigh the new financial data to estimate net price and use the new academic data (GPA/SAT/ACT) to filter for 'safety', 'match', and 'reach' schools based on their 'average_sat', 'average_act', and 'acceptance_rate'.

6. Student Loan Calculator
Task: Build Loan Calculator Component
Prompt: /task Create a new standalone 'Student Loan Calculator' React component. The UI should have form inputs for: 'Loan Amount' ($), 'Interest Rate' (%), and 'Loan Term' (in years).

Prompt: /task Add inputs for 'Years Remaining' and 'Desired Repayment Plan' (e.g., Standard, Graduated).

Prompt: /task Implement the frontend JavaScript logic to calculate and display the 'Estimated Monthly Payment' and 'Total Interest Paid' based on the user's inputs. Ensure the calculation updates in real-time as the user types.