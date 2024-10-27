const mongoose = require('mongoose');
const express = require('express');
const { HfInference } = require('@huggingface/inference');
const cosineSimilarity = require('cosine-similarity');
require('dotenv').config();
const sendOfferEmail = require('./utils/sendOfferEmail');

const app = express();
app.use(express.json());
const uri = process.env.MONGO_URI;
const hf = new HfInference(process.env.HF_TOKEN);
const model = "sentence-transformers/all-MiniLM-L6-v2";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    formResponses: { type: String, required: true },
    candidacyPosition: { type: String, default: '' }

}, { collection: 'applications' }); // Specify the collection name as 'applications'

const User = mongoose.model('User', userSchema);

// // Sample candidate data
// const candidates = [
//     {
//         fullName: "John Smith",
//         email: "giv.joseph2002@gmail.com",
//         formResponses: "What is your highest level of education completed? Bachelor’s Degree\nDo you hold a valid Texas Teacher Certificate? Yes\nHow many years of teaching experience do you have? 3 years\nDescribe your experience in developing lesson plans that meet state standards: In my last position, I developed a year-long curriculum for high school mathematics aligned with Texas state standards. I utilized backward design to ensure each lesson built towards mastery of key concepts.\nDescribe your experience and the strategies you used to support students in educationally underserved communities: I worked at a school in a low-income neighborhood where I implemented after-school tutoring programs to provide additional academic support and mentorship for students struggling with core subjects.\nPlease provide an example of how you have promoted diversity and inclusion in your classroom: I created a classroom library featuring diverse authors and perspectives, allowing students to see themselves represented in the literature we studied.\nWhy are you interested in this position? I am drawn to KIPP Texas Public Schools because of its commitment to equity and excellence in education. I believe my values align closely with the mission of providing quality education to underserved communities.\nWhat makes you a good fit for our team? My experience working with diverse student populations has equipped me with the skills needed to adapt my teaching methods effectively. I am also committed to collaborating with colleagues for continuous improvement.",
//         candidacyPosition: "",

//     },
//     {
//         fullName: "Maria Gonzalez",
//         email: "maria.gonzalez@email.com",
//         formResponses: "What is your highest level of education completed? Master’s Degree\nDo you hold a valid Texas Teacher Certificate? Yes\nHow many years of teaching experience do you have? 7 years\nDescribe your experience in developing lesson plans that meet state standards: During my teaching internship, I created lesson plans for English Language Arts that incorporated state standards while engaging students through project-based learning activities.\nDescribe your experience and the strategies you used to support students in educationally underserved communities: In my previous role, I focused on building relationships with families and organized community workshops to engage parents in their children's education, which significantly improved student attendance and performance.\nPlease provide an example of how you have promoted diversity and inclusion in your classroom: I implemented group projects where students from different backgrounds worked together, encouraging them to share their unique experiences and learn from each other.\nWhy are you interested in this position? I admire KIPP's approach to fostering student growth through a rigorous curriculum and community involvement. I want to be part of a team that is dedicated to making a real difference in students' lives.\nWhat makes you a good fit for our team? I bring a strong track record of helping students achieve academic success, particularly in challenging environments. My dedication aligns well with KIPP's mission.",
//         candidacyPosition: "",

//     },
//     {
//         fullName: "David Brown",
//         email: "nara29504@gmail.com",
//         formResponses: "What is your highest level of education completed? Associate's Degree\nDo you hold a valid Texas Teacher Certificate? Yes\nHow many years of teaching experience do you have? 5 years\nDescribe your experience in developing lesson plans that meet state standards: I have experience creating unit plans for science classes that align with state standards, focusing on hands-on experiments to make learning interactive and relevant.\nDescribe your experience and the strategies you used to support students in educationally underserved communities: I partnered with local organizations to provide resources such as school supplies and access to technology, ensuring all students had the tools they needed to succeed.\nPlease provide an example of how you have promoted diversity and inclusion in your classroom: I facilitated discussions on social justice topics, encouraging students to express their views while fostering an environment of respect and open dialogue.\nWhy are you interested in this position? KIPP's focus on preparing students for college and careers resonates with me, as I want my teaching to empower students with the skills they need for their future endeavors.\nWhat makes you a good fit for our team? I am deeply committed to KIPP's values of persistence and purpose. My proactive approach ensures that I go above and beyond for my students, supporting them academically and emotionally.",
//         candidacyPosition: "",

//     },
// ];

// // Function to insert data
// const seedDatabase = async () => {
//     try {
//         await User.insertMany(candidates);
//         console.log("Data inserted successfully!");
//     } catch (error) {
//         console.error("Error inserting data:", error);
//     } finally {
//         mongoose.connection.close(); // Close the connection once done
//     }
// };

// seedDatabase();


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Run GET request on server startup
const fetchUsersOnStartup = async () => {
    try {
        const users = await User.find();
        console.log('Users fetched on startup:', users);
    } catch (error) {
        console.error('Error fetching users on startup:', error);
    }
};
fetchUsersOnStartup();

// Funtion to get embeddings
async function getEmbeddings(text) {
    try {
        const response = await hf.featureExtraction({
            model: model,
            inputs: text
        });
        return response;
    } catch (error) {
        console.error('Error getting embeddings:', error);
    }
}

// Route to compare job description with applicant data
//app.post('/compare', async (req, res) => {

async function calculateSimilarity() {
    const jobDescription = "2024-25 High School Teacher\
Dallas, TX, USA\
Full-time\
Grade Level: High\
Start Date: Next year opening\
Department: Teacher\
Company Description\
KIPP Texas Public Schools is a network of 59 public charter, open-enrollment, pre-k-12 schools educating nearly 34,000 students across Austin, Dallas-Ft. Worth, Houston, and San Antonio. Together with families and communities, our mission is to create joyful, academically excellent schools that prepare students with the skills and confidence to pursue the paths they choose —college, career, and beyond—so they can lead fulfilling lives and build a more just world.\
Founded in Houston in 1994, and operating as KIPP Texas since 2018, our commitment to diversity, equity, inclusion, and antiracism in our classrooms, in our offices, and in the communities we serve is unwavering. We are looking to hire a diverse team of dynamic, collaborative, and dedicated individuals with an unyielding belief that every child will succeed. Join our Team and Family and champion equity, chase excellence, persist with purpose, bring joy, and help us rise together.\
KIPP Texas is part of the national KIPP network of 255 college-preparatory public charter schools in 20 states and the District of Columbia. Nationwide, KIPP students complete four-year college at a rate of 36 percent, comparable to the national average for all students and approximately three times higher than the average of students from low-income communities.\
Job Description\
Every member of the Team & Family at KIPP Texas Public Schools plays a critical role in ensuring our students have the skills and confidence to pursue the paths they choose - college, career and beyond. Our educators are passionate advocates for their students and their families, working tirelessly to ensure that our students have access to opportunity. In our classrooms and across the KIPP family we embrace, honor and celebrate our differences across several characteristics that construct our unique identities in our little and big KIPPsters. We are especially committed to attracting and developing individuals who share the life experiences of our students because we believe the best work we do is grounded in the realities and experiences of our families and KIPPsters. As a Teacher, you will deliver exceptional instruction and assess student growth. You are dedicated to constant learning and proactively provide academic and cultural support to your school and team.\
As a KIPP Texas Public Schools Teacher, your core responsibilities include: \
Instructional Delivery and Assessment:\
Develop year-long Texas State standards-based unit plans and lesson plans that meet all students\’ learning needs.\
Use assessment data to modify short and long-term plans in order to promote all students\’ academic performance.\
Embrace and incorporate feedback in the spirit of constant improvement.\
Academic and Cultural Support: \
Collaborate with content and grade-level teams to promote an environment of critical thinking and academic rigor.\
Establish and maintain working relationships with students and families based on trust and respect.\
Participate in the daily functions of the school such as morning, lunch, and afternoon supervisory duties.\
Attend critical school events such as staff meetings, open houses, and parent-teacher conferences.\
Develop individualized learning plans for students and communicate these plans to families in parent meetings and conferences.\
Meet professional obligations including timeliness and consistency in meeting deadlines.\
Qualifications\
Skills and Qualifications:\
Bachelor\’s degree from an accredited four-year college or university\
Demonstrated knowledge of core subject area assigned\
Texas Teacher Certificate appropriate for level and/or subject area of assignment, if applicable*\
Must be considered highly-qualified based on NCLB guidelines, if applicable\
Satisfactory outcome of a background check. Employees are responsible for a non-refundable fingerprinting fee (approximately $50.00).\
*A valid Texas Teacher\’s certificate is required for all Pre-K4 and Special Education teaching positions. Proof of licensure will be required prior to starting employment. For more information about obtaining certification click here.\
Competencies:\
Unwavering commitment to KIPP Texas mission, students, families, and community\
Strong record of helping students achieve academic success, primarily with students in educationally underserved communities\
Strong desire to teach an academically intense curriculum and commit to an extended school day, week, and year\
Desire to continuously learn and increase effectiveness as a teacher and professional; offer and receive constructive feedback\
Willingness to be flexible and to go above and beyond to meet the needs of KIPP Texas students\
Additional Information\
KIPP provides equal employment opportunities for all applicants and employees. As an equal opportunity employer, we hire without consideration to race, religion, creed, color, national origin, age, gender, sexual orientation, marital status, veteran status or disability. "


    function calculateCosineSimilarity(vectorA, vectorB) {
        const dotProduct = vectorA.reduce((acc, val, i) => acc + val * vectorB[i], 0);
        const magnitudeA = Math.sqrt(vectorA.reduce((acc, val) => acc + val * val, 0));
        const magnitudeB = Math.sqrt(vectorB.reduce((acc, val) => acc + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }


    try {
        // Get embeddings for job description
        const jobEmbedding = await getEmbeddings(jobDescription);

        // Retrieve all applicant data from MongoDB Atlas
        const candidate = await User.find();
        //const candidateEmbedding = await getEmbeddings(candidate.appl_data);

        //const score = calculateCosineSimilarity(jobEmbedding, candidateEmbedding);
        //console.log(`Name: ${candidate.fullName}, Email: ${candidate.email}, Similarity Score: ${score}`);

        //const score = cosineSimilarity(jobEmbedding[0], candidateEmbedding[0]);


        const similarityScores = await Promise.all(candidate.map(async (candidate) => {
            candidateData = candidate.formResponses;
            console.log('candidate data: ' + candidateData);

            // Get embeddings for each applicant data
            const candidateEmbedding = await getEmbeddings(candidateData);

            // Calculate similarity score
            //const score = cosineSimilarity(jobEmbedding[0], candidateEmbedding[0]); // Extract vectors if needed
            const score = calculateCosineSimilarity(jobEmbedding, candidateEmbedding);
            console.log(`Name: ${candidate.fullName}, Email: ${candidate.email}, Similarity Score: ${score}`);

            console.log('Job Embedding Length:', jobEmbedding.length);
            console.log('Candidate Embedding Length:', candidateEmbedding.length);
            console.log('First Element Type (Job):', typeof jobEmbedding[0]);
            console.log('First Element Type (Candidate):', typeof candidateEmbedding[0]);
            console.log('First Element Type (Job):', jobEmbedding[0]);
            console.log('First Element Type (Candidate):', candidateEmbedding[0]);

            // Update the candidate's candidacyPosition with the similarity score
            const roundedScore = Math.round(score * 100) / 100; // Round to the nearest 2nd decimal
            if (roundedScore >= 0.65) {
                candidate.candidacyPosition = "Accepted";
                await candidate.save();
                await sendOfferEmail(candidate);
            } else {
                candidate.candidacyPosition = "Rejected";
                await candidate.save();
            }
            return {
                fullName: candidate.fullName,
                email: candidate.email,
                similarityScore: score
            };

        }
        ));
        // Send the similarity score as a response
        return ({ similarityScore: similarityScores });
    } catch (error) {
        //({ error: "Error processing candidates" });
        console.error('Error processing candidates:', error);
    }
}
//)
;

calculateSimilarity()





app.post('/applications', async (req, res) => { // Change endpoint to /applications
    const { name, age, experience, skills, answers } = req.body;

    // Create a new user
    const user = new User({ name, age, experience, skills, answers });

    try {
        // Save the user to the database
        const savedUser = await user.save();
        res.status(201).json(savedUser); // Respond with the saved user
    } catch (error) {
        res.status(400).json({ message: 'Error adding user', error });
    }
});

// Endpoint to fetch all users
app.get('/applications', async (req, res) => { // Change endpoint to /applications
    try {
        const users = await User.find();
        console.log(users);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});
