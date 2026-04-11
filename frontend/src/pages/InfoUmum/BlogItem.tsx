import { useNavigate } from "react-router-dom";
import "./BlogItem.scss";

interface BlogItemProps {
  id: number;
  title: string;
  description: string;
  image?: string;
  author: string;
  date: string;
  category: string;
  detailLink: string;
}

export default function BlogItem({
  title,
  description,
  image,
  author,
  date,
  category,
  detailLink,
}: BlogItemProps) {
  const navigate = useNavigate();

  return (
    <article className="blog_item">
      <div className="blog_item_container">

        {/* LEFT */}
        <div className="blog_item_left">
          <div className="blog_info">
            <div className="post_tag">
              <span className="tag-link">{category}</span>
            </div>
            <ul className="blog_meta list">
              <li>
                <span className="meta-link">
                  {author} <i className="ti-user"></i>
                </span>
              </li>
              <li>
                <span className="meta-link">
                  {date} <i className="ti-calendar"></i>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div className="blog_item_right">
          <div className="blog_post">
            {image && (
              <img
                src={image}
                alt={title}
                className="blog_post_image"
              />
            )}
            <div className="blog_details">
              <span
                className="blog_title_link"
                onClick={() => navigate(detailLink)}
              >
                <h2>{title}</h2>
              </span>
              <p className="blog_description">{description}</p>
              <button
                className="read-more-btn"
                onClick={() => navigate(detailLink)}
              >
                Read More
              </button>
            </div>
          </div>
        </div>

      </div>
    </article>
  );
}
