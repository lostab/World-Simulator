import subprocess
import os

os.chdir(r'D:\Work\openclaw\World-Simulator')
result = subprocess.run(['git', 'push', '-u', 'origin', 'main'], 
                       capture_output=True, text=True, timeout=60)
print('STDOUT:', result.stdout)
print('STDERR:', result.stderr)
print('RETURNCODE:', result.returncode)