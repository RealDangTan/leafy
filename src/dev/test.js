import PostModel from '../models/postModel.js';
import Connect from '../db/dbConnect.js';
import dotenv from 'dotenv';

dotenv.config();

const c = Connect(process.env.MONGODB_URI);

const postModel1 = new PostModel({
  title: `Sinh hoạt khoa học tháng 3/2025: "Ứng dụng tính toán lượng tử trong học máy"`,
  subtitle: `Ứng dụng tính toán lượng tử trong học máy`,
  owned_user_id: '67ff5278057b4e8f123c21f9',
  tags: ['Lượng tử', 'Học máy', 'Nơ-ron', 'Công nghệ', 'Khoa học']
});

const postModel2 = new PostModel({
  title: `Edtech-Lab Nghiên cứu thử nghiệm về nhận diện hành vi người học trong lớp học thực tế`,
  subtitle: `Nghiên cứu thử nghiệm về nhận diện hành vi người học trong lớp học thực tế`,
  owned_user_id: '67ffd21f5e871aa2e3e3c952',
  tags: ['Nhận diện', 'Hành vi', 'Người học', 'Lớp học', 'Khoa học']
});

console.log(postModel1._id);
console.log(postModel2._id);

postModel1.save();
postModel2.save();

