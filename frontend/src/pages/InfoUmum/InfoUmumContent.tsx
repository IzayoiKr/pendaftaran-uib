import { blogPosts } from "../../constants/data";
import "./InfoUmumContent.scss";
import BlogItem from "./BlogItem";

export default function InfoUmumContent() {
  return (
    <section className="blog_area">
      <div className="container">
        <div className="blog_left_sidebar">
          {blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <BlogItem
                key={post.id}
                title={post.title}
                description={post.description}
                image={post.image}
                author={post.author}
                date={post.date}
                category={post.category}
                detailLink={post.detailLink}
              />
            ))
          ) : (
            <div className="no-posts">
              <p>No information available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}