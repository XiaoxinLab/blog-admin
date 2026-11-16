#!/bin/bash
# ============================================================
# Blog 后台部署检查
# 用法：bash check-admin.sh
# ============================================================

echo "===== 1. 文件在不在 ====="
if [ -f /opt/blog-admin/index.html ]; then
    echo "OK   /opt/blog-admin/index.html 存在"
    echo "     资源引用："
    grep -o 'src="[^"]*"' /opt/blog-admin/index.html | head -3 | sed 's/^/       /'
else
    echo "FAIL /opt/blog-admin/index.html 不存在"
    echo "     解压命令：unzip -o blog-admin-dist-lite.zip -d /opt/blog-admin"
fi

echo ""
echo "===== 2. assets 目录 ====="
if [ -d /opt/blog-admin/assets ]; then
    echo "OK   assets 目录存在，共 $(ls /opt/blog-admin/assets | wc -l) 个文件"
    ls /opt/blog-admin/assets | head -5 | sed 's/^/       /'
else
    echo "FAIL /opt/blog-admin/assets 不存在"
fi

echo ""
echo "===== 3. Nginx 里 admin 的配置 ====="
grep -rn -A 8 "location /admin" /etc/nginx/conf.d/ /etc/nginx/nginx.conf 2>/dev/null | head -30

echo ""
echo "===== 4. 关键点：有没有用 alias ====="
CONF=$(grep -rn -A 6 "location /admin" /etc/nginx/conf.d/ /etc/nginx/nginx.conf 2>/dev/null | head -12)
if echo "$CONF" | grep -q "alias"; then
    echo "OK   用了 alias"
else
    echo "WARN 没看到 alias"
    echo "     用 root 的话路径会拼成 /opt/blog-admin/admin/xxx，找不到文件。"
    echo "     正确写法："
    echo "       location /admin/ {"
    echo "           alias /opt/blog-admin/;"
    echo "           index index.html;"
    echo "           try_files $uri $uri/ /admin/index.html;"
    echo "       }"
fi

echo ""
echo "===== 5. 接口转发 ====="
if grep -rn "location /request" /etc/nginx/conf.d/ /etc/nginx/nginx.conf 2>/dev/null | head -3; then
    echo "OK   有 /request 的转发配置"
else
    echo "FAIL 没找到 /request 的转发配置"
fi

echo ""
echo "===== 6. 后端在不在跑 ====="
echo "     blog-server: $(systemctl is-active blog-server 2>/dev/null)"
curl -s -o /dev/null -w "     后端 8000 端口: HTTP %{http_code}\n" http://127.0.0.1:8000/request/article/ 2>/dev/null

echo ""
echo "===== 7. 最近的 nginx 错误 ====="
tail -n 8 /var/log/nginx/error.log 2>/dev/null | sed 's/^/     /'
