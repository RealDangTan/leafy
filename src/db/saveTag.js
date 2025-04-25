import Connect from './dbConnect.js';
import TagModel from '../models/tagModel.js';

Connect("mongodb+srv://11236187:Pass*is*1234@cluster0.am0qsfd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

async function saveTag(tags) {
    console.log(tags);
    for (let tag of tags) {
        const tagExists = await TagModel.findOne({ name: tag.name });
        if (tagExists) {
            console.log(`Tag ${tag.name} duplicated!`);
            continue;
        };
        const newTag = new TagModel({
            name: tag.name,  // String
            group: tag.group, // List of strings
        });
        await newTag.save();
        console.log(`Tag ${tag.name} saved successfully!`);
    }
}

const tags = [
    // Hot - Research Fields
    {"name": "AI", "group": "Hot"},
    {"name": "Machine Learning", "group": "Hot"},
    {"name": "Deep Learning", "group": "Hot"},
    {"name": "Natural Language Processing", "group": "Hot"},
    {"name": "Computer Vision", "group": "Hot"},
    {"name": "Quantum Computing", "group": "Hot"},
    {"name": "Data Science", "group": "Hot"},
    {"name": "Statistics", "group": "Hot"},
    {"name": "Mathematics", "group": "Hot"},
    {"name": "Theoretical Physics", "group": "Hot"},
    {"name": "Astrophysics", "group": "Hot"},
    {"name": "Biophysics", "group": "Hot"},
    {"name": "Biotechnology", "group": "Hot"},
    {"name": "Genetics", "group": "Hot"},
    {"name": "Neuroscience", "group": "Hot"},
    {"name": "Cognitive Science", "group": "Hot"},
    {"name": "Sociology", "group": "Hot"},
    {"name": "Anthropology", "group": "Hot"},
    {"name": "Economics", "group": "Hot"},
    {"name": "Behavioral Science", "group": "Hot"},
    {"name": "Cybersecurity", "group": "Hot"},
    {"name": "Blockchain", "group": "Hot"},
    {"name": "Cryptography", "group": "Hot"},
    {"name": "Robotics", "group": "Hot"},
    {"name": "Embedded Systems", "group": "Hot"},
    {"name": "Environmental Science", "group": "Hot"},
    {"name": "Ecology", "group": "Hot"},
    {"name": "Climate Change", "group": "Hot"},
    {"name": "Marine Biology", "group": "Hot"},
    {"name": "Geology", "group": "Hot"},
    {"name": "Astronomy", "group": "Hot"},
    {"name": "Space Exploration", "group": "Hot"},
    {"name": "Linguistics", "group": "Hot"},
    {"name": "Philosophy of Science", "group": "Hot"},
    {"name": "Artificial General Intelligence", "group": "Hot"},
    {"name": "Computer Graphics", "group": "Hot"},
    {"name": "Human-Computer Interaction", "group": "Hot"},
    {"name": "Educational Technology", "group": "Hot"},
    {"name": "Nanotechnology", "group": "Hot"},
    {"name": "Materials Science", "group": "Hot"},
    {"name": "Bioinformatics", "group": "Hot"},
    {"name": "Operations Research", "group": "Hot"},
    {"name": "Systems Engineering", "group": "Hot"},
    {"name": "Cognitive Robotics", "group": "Hot"},
    {"name": "Computational Biology", "group": "Hot"},
    {"name": "Biomedical Engineering", "group": "Hot"},
    {"name": "Information Theory", "group": "Hot"},
    {"name": "Game Theory", "group": "Hot"},
    {"name": "Control Systems", "group": "Hot"},
  
    // Club - Research Clubs
    {"name": "Math Club", "group": "Club"},
    {"name": "Physics Club", "group": "Club"},
    {"name": "AI Club", "group": "Club"},
    {"name": "Robotics Club", "group": "Club"},
    {"name": "Biotech Club", "group": "Club"},
    {"name": "Data Science Club", "group": "Club"},
    {"name": "Chemistry Club", "group": "Club"},
    {"name": "Astronomy Club", "group": "Club"},
    {"name": "Quantum Club", "group": "Club"},
    {"name": "ML Research Group", "group": "Club"},
    {"name": "Neuroscience Circle", "group": "Club"},
    {"name": "Environmental Club", "group": "Club"},
    {"name": "Coding for Research", "group": "Club"},
    {"name": "Computational Biology Club", "group": "Club"},
    {"name": "Statistics Society", "group": "Club"},
    {"name": "HCI Innovation Lab", "group": "Club"},
    {"name": "Blockchain Research Circle", "group": "Club"},
    {"name": "Sustainable Tech Club", "group": "Club"},
    {"name": "Science & Society Group", "group": "Club"},
    {"name": "Quantum Logic Club", "group": "Club"},
  
    // Award - Research Awards
    {"name": "First Prize Award", "group": "Award"},
    {"name": "Second Prize Award", "group": "Award"},
    {"name": "Third Prize Award", "group": "Award"},
    {"name": "Best Research Award", "group": "Award"},
    {"name": "Innovation Award", "group": "Award"},
    {"name": "Young Researcher Award", "group": "Award"},
    {"name": "Outstanding Paper Award", "group": "Award"},
    {"name": "Best Poster Award", "group": "Award"},
    {"name": "Excellence in Research Award", "group": "Award"},
    {"name": "Top Cited Paper Award", "group": "Award"},
    {"name": "Interdisciplinary Research Award", "group": "Award"},
    {"name": "AI Breakthrough Award", "group": "Award"},
    {"name": "Pioneering Research Prize", "group": "Award"},
    {"name": "Innovation in Science Award", "group": "Award"},
    {"name": "Distinguished Research Award", "group": "Award"},
    {"name": "Scientific Achievement Award", "group": "Award"},
    {"name": "Visionary Researcher Award", "group": "Award"},
    {"name": "Best Collaborative Project Award", "group": "Award"},
    {"name": "Emerging Research Talent Award", "group": "Award"},
    {"name": "Best Thesis Award", "group": "Award"},
    {"name": "Global Science Challenge Winner", "group": "Award"},
    {"name": "National Innovation Award", "group": "Award"},
    {"name": "Top Innovator Award", "group": "Award"},
    {"name": "Breakthrough Discovery Award", "group": "Award"},
    {"name": "Scientific Merit Award", "group": "Award"},
    {"name": "Technology Leadership Prize", "group": "Award"},
    {"name": "Academic Research Excellence Award", "group": "Award"},
    {"name": "STEM Star Award", "group": "Award"},
    {"name": "Best Experimental Design Award", "group": "Award"},
    {"name": "Grand Prize in Science Fair", "group": "Award"}
  ];
saveTag(tags)