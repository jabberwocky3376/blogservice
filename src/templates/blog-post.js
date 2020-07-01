import React from 'react'
import PropTypes, { bool } from 'prop-types'
import { kebabCase } from 'lodash'
import { Helmet } from 'react-helmet'
import { graphql, Link } from 'gatsby'
import Layout from '../components/Layout'
import Content, { HTMLContent } from '../components/Content'

export const BlogPostTemplate = ({
  content,
  contentComponent,
  date,
  tags,
  title,
  helmet,
}) => {
  const PostContent = contentComponent || Content

  return (
    <section className="section" style={{ margin: `5rem 7rem 0 7rem` }}>
      {helmet || ''}
      <div className="container content">
        <div className="columns">
          <div className="column is-10 is-offset-1">
            <p style={{ textAlign:`center`, fontStyle: `italic`}}>
              -&nbsp;&nbsp;{date}&nbsp;&nbsp;-
            </p>
            <h1 className="title is-size-2 has-text-weight-bold is-bold-light" style={{ color: `#333` }}>
              {title}
            </h1>
            {tags && tags.length ? (
              <div style={{ margin: `4rem 0 4rem 0` , textAlign:`center`}} >#
                  {tags.map((tag) => (
                    <div key={tag + `tag`}  style={{ display: `inline`}}>
                      &nbsp;&nbsp;<Link to={`/tags/${kebabCase(tag)}/`}>{tag}</Link>
                    </div>
                  ))}
              </div>
            ) : null}
            <div style={{lineHeight: `1.9`, letterSpacing: `0.06em` ,color: `#333`, marginBottom: `5rem`}}>
              <PostContent content={content} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

BlogPostTemplate.propTypes = {
  content: PropTypes.node.isRequired,
  contentComponent: PropTypes.func,
  date: PropTypes.string,
  title: PropTypes.string,
  helmet: PropTypes.object,
}

const BlogPost = ({ data }) => {
  const { markdownRemark: post } = data

  return (
    <Layout>
      <BlogPostTemplate
        content={post.html}
        contentComponent={HTMLContent}
        date={post.frontmatter.date}
        helmet={
          <Helmet titleTemplate="%s | Blog">
            <title>{`${post.frontmatter.title}`}</title>
            <meta
              name="description"
              content={`${post.frontmatter.description}`}
            />
          </Helmet>
        }
        tags={post.frontmatter.tags}
        title={post.frontmatter.title}
      />
    </Layout>
  )
}

BlogPost.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.object,
  }),
}

export default BlogPost

export const pageQuery = graphql`
  query BlogPostByID($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      html
      frontmatter {
        date(formatString: "YYYY/MM/DD")
        title
        description
        tags
      }
    }
  }
`
