import { useNavigate } from "react-router-dom";
import "./BlogItem.scss";
import { BlogIconMap } from '../../components/Icons';

interface BlogItemProps {
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

        {/* LEFT — category tag + meta */}
        <div className="blog_item_left">
          <div className="blog_info">
            <div className="post_tag">
              <span className="tag-link">{category}</span>
            </div>
            <ul className="blog_meta list">
              <li>
                <span className="meta-link">
                  {author} {BlogIconMap.Person}
                </span>
              </li>
              <li>
                <span className="meta-link">
                  {date} {BlogIconMap.Calendar}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT — image + content */}
        <div className="blog_item_right">
          {image && (
            <img src={image} alt={title} className="blog_post_image" />
          )}
          <div className="blog_details">
            <h2
              className="blog_title_link"
              onClick={() => navigate(detailLink)}
            >
              {title}
            </h2>
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
    </article>
  );
}