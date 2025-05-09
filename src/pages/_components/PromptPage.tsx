import React, { useContext, useState, useCallback, useMemo, Suspense } from "react";
import { Card, Typography, Tag, Tooltip, Space, Row, Col, Badge, Button, ConfigProvider, theme } from "antd";
import { LinkOutlined, CopyOutlined, CheckOutlined } from "@ant-design/icons";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Translate from "@docusaurus/Translate";
import { useCopyToClipboard } from "@site/src/hooks/useCopyToClipboard";
import themeConfig from "@site/src/pages/_components/themeConfig";
import { AuthContext } from "@site/src/pages/_components/AuthContext";
import { getWeight, formatCount } from "@site/src/utils/formatters";

const ShareButtons = React.lazy(() => import("./ShareButtons"));
const Comments = React.lazy(() => import("./Comments"));

const { Paragraph } = Typography;

const styles = {
  container: { marginTop: "20px" },
  badge: { backgroundColor: "#52c41a" },
  remark: { color: "#595959" },
  commentInfo: {
    color: "gray",
    fontSize: "0.9em",
    marginTop: "20px",
  },
  mainText: { maxHeight: "500px", overflowY: "auto" as React.CSSProperties["overflowY"], minHeight: "100px" },
};

function PromptPage({ prompt }) {
  const { userAuth } = useContext(AuthContext);
  const { i18n } = useDocusaurusContext();
  const currentLanguage = i18n.currentLocale.split("-")[0];
  const canToggle = currentLanguage !== "en" && prompt[currentLanguage].description !== prompt[currentLanguage].prompt;
  const [paragraphText, setParagraphText] = useState(prompt[currentLanguage].prompt);
  const { copied, updateCopy } = useCopyToClipboard();

  // 使用 useMemo 缓存计算值
  const { shareUrl, title, remark, weight, website, tags, isDarkMode } = useMemo(
    () => ({
      shareUrl: typeof window !== "undefined" ? window.location.href : "",
      title: prompt[currentLanguage].title,
      remark: prompt[currentLanguage].remark,
      weight: getWeight(prompt),
      website: prompt.website,
      tags: prompt.tags,
      isDarkMode: typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark",
    }),
    [prompt, currentLanguage]
  );

  const handleParagraphClick = useCallback(() => {
    if (!canToggle) return;
    setParagraphText((prevText) => (prevText === prompt[currentLanguage].prompt ? prompt[currentLanguage].description : prompt[currentLanguage].prompt));
  }, [prompt, currentLanguage]);

  return (
    <ConfigProvider
      theme={{
        ...themeConfig,
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
      <Layout title={title} description={remark}>
        <Row justify="center" style={styles.container}>
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Card
              className="shadow--md"
              title={
                <>
                  {title} <Badge count={`${formatCount(weight)}`} style={styles.badge} />
                </>
              }
              extra={
                <Space>
                  <Button
                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={() => {
                      updateCopy(prompt[currentLanguage].prompt, prompt.id);
                    }}>
                    {copied ? <Translate id="theme.CodeBlock.copied">已复制</Translate> : <Translate id="theme.CodeBlock.copy">复制</Translate>}
                  </Button>
                  {website && (
                    <Link to={website}>
                      <LinkOutlined />
                    </Link>
                  )}
                </Space>
              }>
              <Paragraph style={styles.remark}>👉 {remark}</Paragraph>
              {canToggle ? (
                <Tooltip title={<Translate id="tooltip.switchLang">点击切换显示语言</Translate>}>
                  <Paragraph onClick={handleParagraphClick} style={(styles.mainText, { cursor: "pointer" })}>
                    {paragraphText}
                  </Paragraph>
                </Tooltip>
              ) : (
                <Paragraph style={styles.mainText}>{paragraphText}</Paragraph>
              )}
              <Space wrap>
                {tags.map((tag) => (
                  <Link to={`/?tags=${tag}`} key={tag}>
                    <Tag color="blue">{tag}</Tag>
                  </Link>
                ))}
              </Space>
              <Paragraph style={styles.commentInfo}>
                <Translate id="comments.info">请在下方回复您对本提示词的意见、想法或分享。</Translate>
              </Paragraph>

              <Suspense fallback={null}>
                <ShareButtons shareUrl={shareUrl} title={`${title}: ${remark}`} popOver={true} />
                <Comments pageId={prompt.id} currentUserId={userAuth?.data?.id || 0} type="page" />
              </Suspense>
            </Card>
          </Col>
        </Row>
      </Layout>
    </ConfigProvider>
  );
}

// 使用 memo 优化整个组件的重渲染
export default React.memo(PromptPage);
