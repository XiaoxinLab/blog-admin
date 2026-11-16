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
    echo "     解压：unzip -o blog-admin-dist-lite.zip -d /opt/blog-admin"
fi

echo ""
echo "===== 2. assets 目录 ====="
if [ -d /opt/blog-admin/assets ]; then
    echo "OK   assets 目录存在，共 $(ls /opt/blog-admin/assets | wc -l) 个文件"
else
    echo "FAIL /opt/blog-admin/assets 不存在"
fi

echo ""
echo "===== 3. 实测：浏览器到底能不能拿到文件 ====="
JS=$(grep -o 'src="[^"]*\.js"' /opt/blog-admin/index.html | head -1 | sed 's/src="//;s/"//')
if [ -n "$JS" ]; then
    echo "     测试地址: https://qisui.asia/admin/$JS"
    CODE=$(curl -sk -o /dev/null -w "%{http_code}" "https://qisui.asia/admin/$JS")
    if [ "$CODE" = "200" ]; then
        echo "     OK   HTTP 200，JS 能正常加载"
    else
        echo "     FAIL HTTP $CODE —— JS 加载不到，页面就是空白的"
        echo "          多半是 alias 配了 try_files，把 try_files 那行删掉再 reload"
    fi
else
    echo "     没从 index.html 里读到 js 文件名"
fi

echo ""
echo "===== 4. Nginx 里 admin 的配置 ====="
grep -rn -A 8 "location /admin" /etc/nginx/conf.d/ /etc/nginx/nginx.conf 2>/dev/null | head -20

echo ""
echo "===== 5. 两个致命配置检查 ====="
CONF=$(grep -rn -A 8 "location /admin" /etc/nginx/conf.d/ /etc/nginx/nginx.conf 2>/dev/null | head -14)
if echo "$CONF" | grep -q "alias"; then
    echo "OK   用了 alias"
else
    echo "FAIL 没看到 alias，应该写 alias /opt/blog-admin/;"
fi
if echo "$CONF" | grep -q "try_files"; then
    echo "FAIL 有 try_files —— 它和 alias 一起用会 404"
    echo "     后台是 hash 路由，不需要 try_files，删掉这一行"
else
    echo "OK   没有 try_files"
fi

echo ""
echo "===== 6. 接口转发 ====="
grep -rn -A 3 "location /request" /etc/nginx/conf.d/*.conf 2>/dev/null | head -8
echo ""
echo "     实测接口："
curl -sk -o /dev/null -w "     https://qisui.asia/request/article/ -> HTTP %{http_code}\n" https://qisui.asia/request/article/

echo ""
echo "===== 7. 后端服务 ====="
echo "     blog-server: $(systemctl is-active blog-server 2>/dev/null)"
curl -s -o /dev/null -w "     后端直连 /article/ -> HTTP %{http_code}\n" http://127.0.0.1:8000/article/ 2>/dev/null

echo ""
echo "===== 8. nginx 错误日志 ====="
tail -n 6 /var/log/nginx/error.log 2>/dev/null | sed 's/^/     /'
