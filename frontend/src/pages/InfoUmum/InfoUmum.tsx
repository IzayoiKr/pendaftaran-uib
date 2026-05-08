import BlogItem from "./BlogItem";
import { blogPosts } from "./data";
import "./InfoUmum.scss";

export default function InfoUmum() {
    return (
        <section className="info-umum-section">
            <div className="blog_area section_gap">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="blog_left_sidebar">
                                {blogPosts.length > 0 ? (
                                    blogPosts.map((post) => (
                                        <BlogItem
                                            key={post.id}
                                            id={post.id}
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
                    </div>
                </div>
            </div>
        </section>
    );
}
