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
    candidacyPosition: { type: String, default: '' },
    similarityScore: { type: Number, default: 0 },

}, { collection: 'applications' }); // Specify the collection name as 'applications'

const User = mongoose.model('User', userSchema);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


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

// Function to calculate similarity
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

        const similarityScores = await Promise.all(candidate.map(async (candidate) => {
            candidateData = candidate.formResponses;
            console.log('candidate data: ' + candidateData);

            // Get embeddings for each applicant data
            const candidateEmbedding = await getEmbeddings(candidateData);

            // Calculate similarity score
            const score = calculateCosineSimilarity(jobEmbedding, candidateEmbedding);
            console.log(`Name: ${candidate.fullName}, Email: ${candidate.email}, Similarity Score: ${score}`);


            // Update the candidate's candidacyPosition with the similarity score
            const roundedScore = Math.round(score * 100) / 100;
            candidate.similarityScore = roundedScore; // Round to the nearest 2nd decimal
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

