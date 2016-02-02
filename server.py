import BaseHTTPServer

class Handler( BaseHTTPServer.BaseHTTPRequestHandler ):
    def do_GET( self ):
        print self.path
        if self.path == '/static/bundle.js':
          self.send_response(200)
          self.send_header( 'Content-type', 'text/javascript' )
          self.end_headers()
          self.wfile.write( open('dist/static/bundle.js').read() )
        elif self.path == '/static/styles.css':
          self.send_response(200)
          self.send_header( 'Content-type', 'text/css' )
          self.end_headers()
          self.wfile.write( open('dist/static/styles.css').read() )
        else:
          self.send_response(200)
          self.send_header( 'Content-type', 'text/html' )
          self.end_headers()
          self.wfile.write( open('dist/index.html').read() )

httpd = BaseHTTPServer.HTTPServer( ('0.0.0.0', 8000), Handler )
httpd.serve_forever()