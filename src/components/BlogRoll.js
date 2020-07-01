import React from 'react'
import PropTypes from 'prop-types'
import { Link, graphql, StaticQuery } from 'gatsby'
import PreviewCompatibleImage from './PreviewCompatibleImage'

class BlogRoll extends React.Component {
  render() {
    const { data } = this.props
    const { edges: posts } = data.allMarkdownRemark

    return (
      <div className="columns">
        <div className="column">
          {posts &&
            posts.map(({ node: post }) => (
              <div className="tile is-parent" key={post.id}>
                <Link to={post.fields.slug}>
                  <article
                    className={`blog-list-item tile is-child box ${
                      post.frontmatter.featuredpost ? 'is-featured' : ''
                    }`}
                  >
                    <header>
                      {post.frontmatter.featuredimage ? (
                        <div className="featured-thumbnail">
                          <PreviewCompatibleImage
                            imageInfo={{
                              image: post.frontmatter.featuredimage,
                              alt: `featured image thumbnail for post ${post.frontmatter.title}`,
                            }}
                          />
                        </div>
                      ) : null}
                      <p className="post-meta">
                        <span className="title is-size-4">
                          {post.frontmatter.title}
                        </span>
                        <span>  </span>
                        <span className="subtitle is-size-6 is-block">
                          {post.frontmatter.date}
                          <p>
                            <br />
                            {post.excerpt}
                          </p>
                        </span>
                      </p>
                    </header>
                  </article>
                </Link>
              </div>
            ))}
        </div>
      </div>
    )
  }
}

BlogRoll.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      edges: PropTypes.array,
    }),
  }),
}

export default () => (
  <StaticQuery
    query={graphql`
      query BlogRollQuery {
        allMarkdownRemark(
          sort: { order: DESC, fields: [frontmatter___date] }
          filter: { frontmatter: { templateKey: { eq: "blog-post" } } }
        ) {
          edges {
            node {
              excerpt(pruneLength: 200)
              id
              fields {
                slug
              }
              frontmatter {
                title
                templateKey
                date(formatString: "MMMM DD, YYYY")
                featuredpost
                featuredimage {
                  childImageSharp {
                    fluid(maxWidth: 240, quality: 100) {
                      ...GatsbyImageSharpFluid
                    }
                  }
                }
              }
            }
          }
        }
      }
    `}
    render={(data, count) => <BlogRoll data={data} count={count} />}
  />
)
